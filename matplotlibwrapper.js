function matplotlibwrapper(code) {
    var escapedCode = code.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    var progToRun = 
`import subprocess, base64, html, os

def make_data_uri(filename):
with open(filename, "br") as fin:
    contents = fin.read()
contents_b64 = base64.b64encode(contents).decode("utf8")
return "data:image/png;base64,{}".format(contents_b64)

prog_to_exec = """import os, tempfile
os.environ["MPLCONFIGDIR"] = tempfile.mkdtemp()
import matplotlib as _mpl
_mpl.use("Agg")
` + escapedCode + `
figs = _mpl.pyplot.get_fignums()
for i, fig in enumerate(figs):
_mpl.pyplot.figure(fig)
filename = f'image{i}.png'
_mpl.pyplot.savefig(filename, bbox_inches='tight')
"""
with open('prog.py', 'w') as outfile:
outfile.write(prog_to_exec)

result = subprocess.run(['python3', 'prog.py'], capture_output=True, text=True)
print('<div>')
output = result.stdout + result.stderr
if output:
output = html.escape(output).replace(' ', '&nbsp;').replace('\\n', '<br>')
print(f'<p style="font-family:monospace;font-size:11pt;padding:5px;">{output}</p>')

for fname in os.listdir():
if fname.endswith('png'):
    print(f'<img src="{make_data_uri(fname)}">')
`;
    return progToRun;
}
