# %%
from datetime import datetime

# %%
log_path = "./app.log"

# %%
logs = open(log_path, "r").read()

# %%
log_lines = logs.split("\n2025")

# %%
for index in range(1, len(log_lines)):
    log_lines[index] = {"log": "2025" + log_lines[index]}

# %%
log_lines[0] = {"log": log_lines[0]}

# %%
for line in log_lines:
    line["datetime"] = datetime.strptime(line["log"].split(",")[0], "%Y-%m-%d %H:%M:%S")

# %%
relevant_log_lines = [
    line
    for line in log_lines
    if line["datetime"] >= datetime(2025, 1, 28, 9, 30, 0)
    and line["datetime"] <= datetime(2025, 1, 28, 11, 0, 0)
]

# %%
read_queries = [line for line in relevant_log_lines if "SELECT" in line["log"]]

# %%
len(read_queries)

# %%
write_queries = [line for line in relevant_log_lines if "INSERT" in line["log"]]

# %%
other_queries = [
    line
    for line in relevant_log_lines
    if "SELECT" not in line["log"] and "INSERT" not in line["log"]
    # and "UPDATE" not in line["log"]
    # and "DELETE" not in line["log"]
    and "BEGIN" not in line["log"]
    and "COMMIT" not in line["log"]
    and "You are" not in line["log"]
    and "Task:\n" not in line["log"]
]

# %%
len(other_queries)

# %%
time_diffs = [
    relevant_log_lines[index]["datetime"] - relevant_log_lines[index - 1]["datetime"]
    for index in range(1, len(relevant_log_lines))
]

# %%
import sqlite3


# %%
# %%
def extract_query(log_line):
    """Extract the SQL query from a log line"""
    # Assuming the query is after a comma in the log
    return log_line["log"].split("Executing operation:")[-1].strip()


# %%
def measure_query_times(queries, db_path="./db.sqlite.prod"):
    """Run queries and measure their execution times"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    results = []
    for query_line in queries:
        query = extract_query(query_line)

        # Start timing
        cursor.execute("SELECT sqlite_version()")  # Warm up connection
        start_time = datetime.now()

        # Execute query
        cursor.execute(query)

        # End timing
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()

        results.append(
            {
                "query": query,
                "execution_time": execution_time,
                "timestamp": query_line["datetime"],
            }
        )

    conn.close()
    return results


print(len(read_queries))
# %%
# read_query_times = measure_query_times(read_queries)

# %%
# times = [time["execution_time"] for time in read_query_times]

# %%
import numpy as np

# Calculate percentiles
# p90 = np.percentile(times, 90)
# p95 = np.percentile(times, 95)
# p99 = np.percentile(times, 99)

# print(f"P90: {p90:.3f}s")
# print(f"P95: {p95:.3f}s")
# print(f"P99: {p99:.3f}s")

# %%


# %%
write_query_times = measure_query_times(write_queries)

# %%

print(len(write_query_times))
times = [time["execution_time"] for time in write_query_times]

# %%
import numpy as np

# Calculate percentiles
p90 = np.percentile(times, 90)
p95 = np.percentile(times, 95)
p99 = np.percentile(times, 99)

print(f"P90: {p90:.3f}s")
print(f"P95: {p95:.3f}s")
print(f"P99: {p99:.3f}s")

# %%


# %%


# %%


# %%


# %%


# %%


# %%
