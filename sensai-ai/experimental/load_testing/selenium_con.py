import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import argparse


def run_single_user():
    cmd = [
        "python",
        "selenium_test.py",
    ]

    # Run the single_test script as a subprocess
    result = subprocess.run(cmd, capture_output=True, text=True)
    stdout, stderr = result.stdout, result.stderr

    if stdout:
        print("STDOUT:", stdout.strip())
    if stderr:
        print("STDERR:", stderr.strip())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run multiple browser sessions concurrently."
    )
    # parser.add_argument(
    #     "--url", required=True, help="The URL of the Streamlit app to test."
    # )
    parser.add_argument(
        "--users", type=int, default=10, help="Number of concurrent users."
    )
    # parser.add_argument(
    #     "--stay_open_seconds",
    #     type=int,
    #     default=5,
    #     help="How long each user keeps the browser open.",
    # )
    # parser.add_argument(
    #     "--headless", action="store_true", help="Run browsers in headless mode."
    # )
    args = parser.parse_args()

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(run_single_user) for _ in range(20)]

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error in worker: {e}")

    # with ThreadPoolExecutor(max_workers=args.users) as executor:
    #     futures = [executor.submit(run_single_user) for _ in range(args.users)]

    #     for future in as_completed(futures):
    #         stdout, stderr = future.result()
    #         if stdout:
    #             print("STDOUT:", stdout.strip())
    #         if stderr:
    #             print("STDERR:", stderr.strip())
