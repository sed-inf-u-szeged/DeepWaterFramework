strategy_type = "assembler"
config = {
    "strategy_id": "JSProcessMetrics",
    "name": "JavaScript Process Metrics",
    "parameters": [
        {
            "parameter_id": "csvDir",
            "label": "Raise CSV File",
            "type": "path",
            "required": True
        },
        {
            "parameter_id": "outputDir",
            "label": "CSV Output Directory",
            "type": "path",
            "required": True
        },
        {
            "parameter_id": "metrics",
            "label": "Select metrics <br /> (LOC, NOI, McCC, NOS, TCD, NUMPAR, NL, NLE, WarningBlocker, WarningCritical, WarningInfo, WarningMajor, WarningMinor, CD, CLOC, AVGNOEMT, NOCC, TLLOC, MNOEMT, TLOC, MNOML, TCLOC, AVGNOML, NII, NOADD, NOCHG, SOADD, MNOAL, LLOC, TNOS, AVGNOAL, CChurn, DLOC, NOContr, AVGTBC, SOMOD, NOMOD, MNODL, AVGNODL, SODEL, NODEL, CC, CI, LDC, CCL, CCO, CLC, LLDC, CLLC)",
        },
        {
            "parameter_id": "projects",
            "label": "Projects",
        },
        {
            "parameter_id": "old_metrics",
            "label": "Use old metrics",
            "default_value": "yes",
        }
    ]
}
