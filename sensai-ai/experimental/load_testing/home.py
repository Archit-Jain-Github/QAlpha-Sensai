from locust import HttpUser, task, between
from locust.env import Environment
from locust.stats import stats_printer, stats_history
from locust.runners import Runner
import gevent
import matplotlib.pyplot as plt
import pandas as pd


class WebsiteUser(HttpUser):
    # Wait between 1 and 2 seconds between tasks
    wait_time = between(5, 6)

    @task
    def visit_home(self):
        self.client.get("?email=amandalmia18@gmail.com")

    @task(4)
    def visit_task(self):
        # Wait between 2-5 seconds before making the request
        self.wait()
        self.client.get(
            "task?id=31&email=amandalmia18@gmail.com&cohort=9&course=9&user_input=Hello"
        )
        # Wait between 2-5 seconds after making the request
        self.wait()


def run_load_test(concurrent_users: list, test_time: int = 30):
    """Run load test for different numbers of concurrent users"""
    results = []

    for num_users in concurrent_users:
        print(f"\nTesting with {num_users} concurrent users...")

        # Set up environment and runner
        env = Environment(user_classes=[WebsiteUser])
        env.create_local_runner()

        # Set host
        WebsiteUser.host = "https://sensai.dev.hyperverge.org"

        # Start a greenlet that periodically outputs the current stats
        gevent.spawn(stats_printer(env.stats))

        # Start the test
        env.runner.start(num_users, spawn_rate=10)

        # Run for specified time
        gevent.spawn_later(test_time, lambda: env.runner.quit())
        env.runner.greenlet.join()

        # Collect results
        stats = env.runner.stats.total
        results.append(
            {
                "users": num_users,
                "avg_response_time": stats.avg_response_time
                / 1000,  # Convert to seconds
                "min_response_time": stats.min_response_time / 1000,
                "max_response_time": stats.max_response_time / 1000,
            }
        )

        # Clear stats for next iteration
        env.runner.stats.clear_all()

    return results


def plot_results(results):
    """Plot the load test results"""
    df = pd.DataFrame(results)

    plt.figure(figsize=(10, 6))
    plt.plot(df["users"], df["avg_response_time"], marker="o", label="Average")
    plt.fill_between(
        df["users"], df["min_response_time"], df["max_response_time"], alpha=0.2
    )

    plt.xlabel("Number of Concurrent Users")
    plt.ylabel("Response Time (seconds)")
    plt.title("Load Test Results: Response Time vs Concurrent Users")
    plt.grid(True)
    plt.legend()
    plt.savefig("load_test_results.png")
    plt.close()


if __name__ == "__main__":
    concurrent_users = [5, 10, 20, 50, 100]
    results = run_load_test(concurrent_users)

    # Print summary
    print("\nLoad Test Summary:")
    for result in results:
        print(f"\nConcurrent Users: {result['users']}")
        print(f"Average Response Time: {result['avg_response_time']:.2f} seconds")
        print(f"Min Response Time: {result['min_response_time']:.2f} seconds")
        print(f"Max Response Time: {result['max_response_time']:.2f} seconds")

    # Generate plot
    plot_results(results)
    print("\nResults plot saved as 'load_test_results.png'")
