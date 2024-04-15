function gnuplotwrapper(code) {
    var escapedCode = code.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    var progToRun = 

    `import os, subprocess, sys, base64, json, re
def get_png_data_uri(filename):
    
    try:
        with open(filename, 'br') as fin:
            contents = fin.read()
    except FileNotFoundError:
        return ''
    b64 = base64.b64encode(contents).decode('utf8')
    img_plot_html = f'<img id="img-plot" width=500 style="margin:3px;border:1px solid black;display:block" src="data:image/png;base64,{b64}">'
    return img_plot_html

# Construct a script that sets up the gnuplot
# graphics toolkit (must be installed on Jobe, e.g. with apt install gnuplot),
# makes figures invisible (since server is headless), clear, the student answer
# and a line to print the current plot to a file plot.png.
code_to_run = f"""graphics_toolkit gnuplot
f = figure('visible', 'off');
clear;
` + escapedCode + `
try
    print("plot.png", "-dpng"); # Export the graph as plot.png
catch
    # Ignore exceptions - if there's no plot, the output will report this.
end_try_catch
"""
with open('prog.m', 'w', encoding='utf8') as src:
    print(code_to_run, file=src)

# Octave is interpreted so we don't need to compile first. Just go straight
# into the execution phase. stdin is already set up.

failed = False
flags = '--silent --no-gui --no-history --no-window-system --norc'
command = 'octave {} prog.m'.format(flags).split()
output = ''
try:
    with open('prog.stderr', 'w', encoding='utf8'):
        output = subprocess.check_output(
            command,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
except subprocess.CalledProcessError as e:
    if e.returncode > 0:
        # Ignore non-zero positive return codes
        if e.output:
            output += e.output
    else:
        # But negative return codes are signals
        if e.output:
            output += e.output
        if e.returncode < 0:
            output += f"Task failed with signal {-e.returncode}"
            
# Analyse the output from the Octave run in any suitable way.
# generate appropriate feedback to student. 
# This example just displays the actual output and the image file. 
output = output.replace("""warning: using the gnuplot graphics toolkit is discouraged\n\n""","""""")
output = output.replace("""The gnuplot graphics toolkit is not actively maintained and has a number\nof limitations that are ulikely to be fixed.  Communication with gnuplot\nuses a one-directional pipe and limited information is passed back to the\nOctave interpreter so most changes made interactively in the plot window\nwill not be reflected in the graphics properties managed by Octave.  For\nexample, if the plot window is closed with a mouse click, Octave will not\nbe notified and will not update it\'s internal list of open figure windows.\nWe recommend using the qt toolkit instead.""","""""")


if output and re.findall("\w",output) :
   
    output.replace("""\r""", ' ')
    html = f"""<h4>Text output:</h4>\n<pre style=background-color:white>{output}</pre>\n<hr style='border:0px'>\n"""
else:
    html = f"""<h5>No text output</h5>\n"""

image_data_uri = get_png_data_uri('plot.png')
if image_data_uri:
    html += f"""<h4>Plotted graph</h4>{image_data_uri}"""
else:
    html += f"""<h5>No graph found</h5></p>"""

print(html)
`;
return progToRun;
}
