import asyncio
import aiohttp
import time
import argparse
import statistics


async def worker(session, url, results):
    """
    A single worker function that sends a POST request and records response times.
    """
    start_time = time.monotonic()
    try:
        async with session.get(url) as response:
            resp_text = await response.text()
            end_time = time.monotonic()
            latency = (end_time - start_time) * 1000.0  # ms
            if response.status == 200:
                results["latencies"].append(latency)
                results["success_count"] += 1
            else:
                results["failures"].append((response.status, resp_text))
                results["failure_count"] += 1
    except Exception as e:
        end_time = time.monotonic()
        latency = (end_time - start_time) * 1000.0
        results["failures"].append((type(e).__name__, str(e)))
        results["failure_count"] += 1


async def run_load_test(url, total_requests, concurrency):
    results = {"latencies": [], "failures": [], "success_count": 0, "failure_count": 0}

    connector = aiohttp.TCPConnector(limit=concurrency)
    timeout = aiohttp.ClientTimeout(total=300)  # Adjust as needed
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Create a list of tasks
        tasks = []
        for _ in range(total_requests):
            task = asyncio.create_task(worker(session, url, results))
            tasks.append(task)

        start_time = time.monotonic()
        await asyncio.gather(*tasks)
        total_time = time.monotonic() - start_time

    return results, total_time


def print_results(results, total_time):
    success_count = results["success_count"]
    failure_count = results["failure_count"]
    total_requests = success_count + failure_count
    latencies = results["latencies"]

    print("------- Load Test Results -------")
    print(f"Total requests sent: {total_requests}")
    print(f"Success count: {success_count}")
    print(f"Failure count: {failure_count}")
    print(f"Total time: {total_time:.2f} s")

    if latencies:
        avg_latency = statistics.mean(latencies)
        p95 = statistics.quantiles(latencies, n=100)[
            94
        ]  # 95th percentile (index 94 for p95)
        p99 = statistics.quantiles(latencies, n=100)[
            98
        ]  # 99th percentile (index 98 for p99)
        print(f"Average latency: {avg_latency:.2f} ms")
        print(f"95th percentile latency: {p95:.2f} ms")
        print(f"99th percentile latency: {p99:.2f} ms")

    if results["failures"]:
        print("\nSome failure examples:")
        for f in results["failures"][:5]:
            print(f" - {f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load test a Streamlit endpoint.")
    # parser.add_argument("--url", required=True, help="The URL of the endpoint to test.")
    parser.add_argument(
        "--requests", type=int, default=10000, help="Total number of requests to send."
    )
    parser.add_argument(
        "--concurrency", type=int, default=1000, help="Number of concurrent requests."
    )
    args = parser.parse_args()

    # Example payload. Adjust this according to what your app expects.
    # For example, if your app expects a prompt for an LLM:
    # payload = {"prompt": "Write a short poem about the sea."}

    url = "https://sensai.dev.hyperverge.org/task?id=31&email=amandalmia18@gmail.com&cohort=9&course=9&user_input=Hello"

    results, total_time = asyncio.run(
        run_load_test(url, args.requests, args.concurrency)
    )
    print_results(results, total_time)
