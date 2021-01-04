import requests
import os.path
import argparse
import io
import pandas as pd
import datetime
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--csvDir', help="Input CSV directory", required=True)
parser.add_argument('--outputDir', help="Output CSV directory", required=True)
parser.add_argument('--metrics', help="The selected metrics.")
parser.add_argument('--projects', help="Project information in JSON format.")
parser.add_argument('--old_metrics', help="Use old static metrics.")

api_url = 'http://10.111.225.2:8080/backend'

raise_drop_columns = ['name', 'longname', 'path', 'full_repo_path', 'line', 'column', 'endline', 'endcolumn']
proc_drop_columns = ['hash', 'longname', 'type', 'path', 'start_line', 'start_column', 'end_line', 'end_column']


def raise_row_key(row):
    return f"{row['path']}-{row['line']}-{row['column']}-{row['endline']}-{row['endcolumn']}"


def proc_row_key(row):
    return f"{row['path']}-{row['start_line']}-{row['start_column']}-{row['end_line']}-{row['end_column']}"


def embed(_, args_str):
    args = parser.parse_args(args_str.split())

    skip_old_metrics = not args.old_metrics or args.old_metrics.lower() == "no"
    base_name = f"pm_{'som' if skip_old_metrics else 'uom'}_{args.metrics.replace(',', '_') if args.metrics else 'all'}"
    result_path = os.path.join(args.outputDir, f"{base_name}_data.csv")
    if os.path.isfile(result_path):
        return result_path

    raise_projects = {}
    raise_df = pd.read_csv(args.csvDir)
    raise_df.drop_duplicates(subset=None, inplace=True)
    for index, row in raise_df.iterrows():
        p_hash = row['full_repo_path'].split('/')[6]
        if p_hash not in raise_projects:
            raise_projects[p_hash] = {}

        raise_projects[p_hash][raise_row_key(row)] = row

    auth = requests.post(f'{api_url}/user/login', data={'email': 'tviszkok@inf.u-szeged.hu', 'password': '6eGm3fKnCw'})
    json_dict = {
        "sourceCodeElementType": "Function",
    }

    if args.metrics:
        json_dict["metrics"] = args.metrics.split(',')

    projects = get_projects(auth.cookies, json_dict, [
    "8199f4dbde65b5a0db78fa48327129625363c2a6",
    "528be29d1662122a34e204dd607e1c0bd9c16bbc",
    "5061d2c97c9dde0c6f51d60a09c800320d4e6406",
    "288b5316262edd373a218f45cb5a6e6434d1bb7e",
    "fd87eb0ca5e14f213d8b31280d444dbc29c20c50",
    "5a674f3bb9d1118d11b333e3b966c01a571c09e6",
    "9e8a687c370297688d59bcfa430d2142255302b6",
    "94207f8fb6ee8fe26fe18657f6b5aca6def99605",
    "9b84fcad76a8d792d0f2cbae36c89bafe1080d21",
    "db713a1c1b2cf1a9f5f9b52a0e2481be3b0cf1be",
    "2df721965bccdfbbaeed5d5624892accf698e768",
    "a7076dc0bb77ca1eff792c56394cc7c97a1a3b76",
    "a277bcf0f72ae2db5d44a5eb78dce6aaa3e425ed",
    "181fc567d873df065f1e84af7225deb70a8d2eb9",
    "e94b37e20e8e37abce0e7d13265298d86d4081fd",
    "39841f2ec9b17b3b2920fd1eb548d444251f4f56",
    "1adf29af13890d61286840177607edd552a9df97",
    "2c9c3a07845d9a0aae12fa3259983d37b68f918f",
    "dd4ce50392e20b61199bcc66cf34c22efdf2e0f7",
    "f7e161a1993a9673ff4d1b3256368e801774ac86",
    "c53a5c15d52292b1e9af26c4f3852dd4214aa66f",
    "cf825d02b79854ddb81bd53074e30521742e80fd",
    "40d73e2a54427630531e584d8fb1157fd0d136f9",
    "ea2c3a0a3f26c5496b685e8a6fa644a91784d971",
    "6a1c10516e85512c8b5611f58d5cb520294d8edf",
    "5a421af22b0513fcb58ce7e0c9507bdc33909f86"])
    merged_projects = []
    dfs = []
    i = 0
    while i < len(projects):
        print(f"request {i + 1}/{len(projects)}")
        p_hash, project = get_project_data(auth.cookies, projects[i])
        for key, row in project.items():
            proc_row = {k: (0 if pd.isna(v) else v) for k, v in row.items()}
            merged_projects.append(proc_row)

        if merged_projects:
            dfs.append(pd.DataFrame(merged_projects))
            merged_projects = []

        i = i + 1

    # merged_df = pd.DataFrame(merged_projects)
    # merged_df.to_csv(os.path.join(args.outputDir, f"{base_name}_full.csv"), index=False)
    write_df_to_file(os.path.join(args.outputDir, f"{base_name}_full.csv"), dfs)
    keep_cols = [c for c in list(dfs[0].columns) if c not in raise_drop_columns and c not in proc_drop_columns]
    # merged_df[keep_cols].to_csv(result_path, index=False)
    write_df_to_file(result_path, dfs, keep_cols)
    return result_path


def write_df_to_file(file_name, dfs, keep_cols=None):
    if not keep_cols:
        keep_cols = [c for c in list(dfs[0].columns)]

    with open(file_name, 'w') as f:
        dfs[0][keep_cols].to_csv(f, index=False, line_terminator='\n')

    with open(file_name, 'a') as f:
        for df in dfs[1:]:
            df[keep_cols].to_csv(f, header=False, index=False, line_terminator='\n')


def get_project_data(auth_cookies, request_json):
    project = {}
    project_hash = None
    try:
        print(f'request started {datetime.datetime.now()}')
        resp = requests.post(f'{api_url}/datamining/prepare', json=request_json, cookies=auth_cookies)
        print(f'request ended {datetime.datetime.now()}')
        if resp.status_code == 200:
            with io.BytesIO(resp.content) as rc, zipfile.ZipFile(rc) as zf, io.BytesIO(zf.read(zf.namelist()[0])) as csv:
                df = pd.read_csv(csv)
                df.fillna(0)
                df.drop_duplicates(subset=None, inplace=True)
                for index, row in df.iterrows():
                    if not project_hash:
                        project_hash = row['hash']

                    project[proc_row_key(row)] = row.to_dict()

        else:
            print(resp)
            print(request_json)

    except Exception as e:
        print(e)

    return project_hash, project


def get_projects(auth_cookies, json_dict, revisions):
    project_list = requests.post(f'{api_url}/project/list', cookies=auth_cookies, data={'size': 3000}).json()['content']
    projects = []
    for project in project_list:
        branch_list = requests.post(f'{api_url}/project/{project["id"]}/listBranches', cookies=auth_cookies).json()
        for branch in branch_list:
            revision = branch["lastVersion"]["parentHash"]
            if (revisions and revision in revisions) or branch["versionsLeft"] != 0 or branch["branchName"][11:] != branch["lastVersion"]["hash"]:
                continue

            p_json = dict(json_dict)
            p_json["projects"] = [{"id": project["id"], "hashes": [revision]}]
            projects.append(p_json)

    return projects
