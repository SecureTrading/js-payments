import os


branch_name = os.environ["GITHUB_REF"]
print("-".join(branch_name.split("/")[2:]))
print(branch_name)
