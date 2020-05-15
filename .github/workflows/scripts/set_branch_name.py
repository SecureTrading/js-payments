import os


branch_name = os.environ["GITHUB_REF"]
branch_name = "-".join(branch_name.split("/")[2:])
print(branch_name)
