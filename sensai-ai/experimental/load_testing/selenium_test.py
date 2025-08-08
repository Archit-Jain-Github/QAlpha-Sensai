import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import argparse


def run_test(url, headless=True):
    # Set Chrome options
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Initialize driver
    driver = webdriver.Chrome(options=chrome_options)

    start_time = time.monotonic()
    try:
        driver.get(url)

        time.sleep(10)
        # WebDriverWait(driver, 5)

        # If you know which element appears only after LLM response is rendered, wait for it.
        # For example, if the Streamlit app renders an element with `id="llm-result"` after completion:
        # if wait_selector:
        #     WebDriverWait(driver, wait_timeout).until(
        #         EC.visibility_of_element_located((By.CSS_SELECTOR, wait_selector))
        #     )

        # time.sleep(10)

        end_time = time.monotonic()
        load_time = (end_time - start_time) * 1000.0  # ms
        print(f"Load and render time: {load_time:.2f} ms")

        # At this point, the LLM call should have been made and the UI rendered.
        # If the app triggers DB saving as a part of this workflow, it should also be done.

    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        driver.quit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Browser-based load test for a Streamlit endpoint."
    )
    # parser.add_argument(
    #     "--url", required=True, help="The URL of the Streamlit app to test."
    # )
    # parser.add_argument(
    #     "--wait_selector", help="A CSS selector to wait for after rendering."
    # )
    # parser.add_argument(
    #     "--wait_timeout", type=int, default=30, help="Max wait time in seconds."
    # )
    # parser.add_argument(
    #     "--headless", action="store_true", help="Run browser in headless mode."
    # )
    args = parser.parse_args()

    url = "https://sensai.dev.hyperverge.org/task?id=31&email=amandalmia18@gmail.com&cohort=9&course=9&user_input=NewHello"

    run_test(
        url,
        # wait_selector=args.wait_selector,
        # wait_timeout=args.wait_timeout,
        headless=False,
    )
