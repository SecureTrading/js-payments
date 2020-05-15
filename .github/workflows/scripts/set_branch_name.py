import os


print(os.environ)
branch_name = os.environ["GITHUB_BRANCH"]
print(branch_name)
os.environ["BRANCH_NAME"] = "-".join(branch_name.split("/")[2:])
