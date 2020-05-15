import os


print('Setting branch name')
print(os.environ)
branch_name = os.environ["GITHUB_REF"]
print(branch_name)
os.environ["BRANCH_NAME"] = "-".join(branch_name.split("/")[2:])
