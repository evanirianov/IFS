#!/usr/bin/env python
#
# This script parses gcc based output into JSON.
# Works for GCC -fno-diagnostics-show-caret  and cppcheck (template=gcc) and
# Copyright (c) 2017 James Fraser jfrase09@uoguelph.ca
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
# REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
# AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
# INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
# LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
# OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
# PERFORMANCE OF THIS SOFTWARE.


import sys, getopt, os
import io, json
import re
import string
import subprocess
import shlex
import glob

# Include common helper files.
# Note: IFS runs this files from the main IFS/ifs folder.
helperFunctionPath = "./tools/commonTools/"
sys.path.append( os.path.abspath(helperFunctionPath) )
from helperFunctions import *

#import helperFunctions

#Display data in JSON format for the IFS
def decorateData( result, options ):
    json_string = '{\n'
    json_string += '"feedback": [\n'
    for i in range(len(result)):
        json_string += json.dumps(result[i])
        if i != (len(result) - 1):
            json_string +=','
        json_string += '\n'

    json_string += ']\n'
    json_string += '}\n'
    return json_string

# Parsing the output of a couple simple formats
# Each format has a specific character split sequence such as '##' or ':'
# Types specify how to tag the incoming sections
def parse( text, options ):
    results = []
    types = options['splitTypes']



    # file = open("feedback_cppCheck_unzipped", "a");
    # file.write(text);
    # file.close()


    for line in text.splitlines():
        sNum = 0
        feedback = {}
        feedback['toolName'] = options['tool']
        sections = line.split( options['splitSeq'])


        # Check that we can put each parsed section into an expect tag type.
        if( len(sections) == len(types) ):
            for section in sections:
                if( sNum < len(types) ):
                    if( types[sNum] == 'filename'):
                        feedback[ types[sNum] ] = os.path.basename(section)
                    elif ( types[sNum] == "feedback"):
                        feed = section.strip()
                        feedtext = re.findall(r"\[([^[]*)]$",feed)
                        # Find [section] and remove from feedback
                        if( feedtext and len(feedtext) > 0 ):
                            feedback[ 'severity' ] = feedtext[0]
                            fid = feed.find(feedtext[0])
                            if( fid >= 0 ):
                                feedback[ types[sNum] ] = feed[0:fid-1]
                            else:
                                feedback[ types[sNum] ] = feed
                        else:
                            feedback[ types[sNum] ] = feed
                    else:
                        feedback[ types[sNum] ] = section.strip()
                else:
                    sys.stderr.write("************ Error: Section types doesn't mtch split Sections ***** ")
                sNum = sNum + 1
            results.append( feedback )
        #else:
            # This is not so much an error as often an intended not from compiler.
            #print("*** Error: incorrectly matching regular expression items")

    return results


# Short-hand function to return format of parameter
def getNKV( dict, name, key ):
    if( dict[key]):
        return dict['initP'] + name + "=" + dict[key]
    return ""

# Short-hand parameter to also display the key and value
def getKV( dict, key ):
    return getNKV( dict, key, key )


def createCmd( options ):
    iDir = os.path.normpath( os.path.join( options['dir'], options['includeDir']) )
    srcDir = os.path.normpath( os.path.join(options['dir'], options['srcDir']) )
    # Assumption here that we can still try directory for .h and .c files at the top level
    # The intended is for non zip files where just a flat array of files exists.
    if not os.path.isdir(iDir):
        iDir = ""

    if not os.path.isdir(srcDir):
        srcDir = os.path.normpath( os.path.join(options['dir'], "*") )
    else:
        srcDir = os.path.join(srcDir,"*")

    cmdStr = ""
    cmdStr = " ".join( [ options['tool'],
                    getNKV(options,'enable','errorLevel'),
                    getKV(options,'language'),
                    getKV(options,'std'),
                    " ".join(options['flags']),
                    getKV(options,'suppress'),
                    '--template="{file}##{line}##{severity}##{id}##{message}"',
                    " " + srcDir  if iDir == "" else "-I " + iDir + " " + srcDir
                ])

    return cmdStr



# main program that takes arguments
def main(argv):
    idirectory =''
    # Many default options set for cppCheck, most of which will be used in gcc and ctags
    # outFiles are temporary files

    options = { 'tool': 'cppcheck',
                'ifs': True,
                'language':'c',
                'errorLevel':'all',
                'flags': [],
                'std': 'c89',
                'suppress':'',
                'dir':'',
                'splitSeq': "##",
                'splitTypes': [ "filename", "lineNum", "type", "category", "feedback"],
                'outFile':'stdout.txt',
                'outErrFile':'stderr.txt',
                'initP': "--",
                'includeDir': "./include",
                'srcDir': "./src"
                }


    # define command line arguments and check if the script call is validq
    opts, args = getopt.getopt(argv,'t:i:l:e:f:s:u:d:h',
        ['tool=','ifsOff=','language=', 'errorLevel=', 'flags=', 'std=',  'suppress=', 'directory=', 'help'])

    for opt, arg in opts:
        if opt in ('--ifsOff', '-i'):
            options['ifs'] = False
        elif opt in ('--language', '-l'):
            options['language'] = arg
        elif opt in ('--errorLevel', '-e'):
            options['errorLevel'] = arg
        elif opt in ('--flags=', '-f'):
            if arg.startswith('-'): # safeguard against malformed flags
                options['flags'].append(arg)
        elif opt in ('--std=', '-s'):
            options['std'] = arg
        elif opt in ('--suppress', '-u'):
            options['suppress'] = arg
        elif opt in ('directory', '-d'):
            idirectory = arg
            if not (os.path.isdir(idirectory)):
                sys.stderr.write( 'Error. Directory ' + idirectory + ' does not exist.\n' )
                sys.exit()
        else:
            print( 'Usage: Parses specific GCC/CPPCheck output files types to JSON format')
            print( 'programmingParser.py [-i IFS MODE] [-l LANGUAGE] [-e ERROR LEVEL] [-f FLAGS] [-s STD] [-u SUPPRESS MSG] -d InputDirectory')
            sys.exit()

    if idirectory != '':
        options['dir'] = idirectory

        cmd = createCmd( options )

        if( cmd ):
            try:
                outFile = "./" + os.path.normpath( os.path.join( idirectory, options['outFile']) )
                outErrFile = "./" + os.path.normpath( os.path.join( idirectory, options['outErrFile']) )

                out, err = getProcessInfo( cmd, outFile, outErrFile )
                result = parse( err, options )

                displayResultToIFS(options, decorateData, idirectory,"/feedback_cppCheck_unzipped", result )

            except:
                sys.stderr.write("Unable to successfully retrieve compiler information\n")
        else:
            sys.stderr.write( 'Invalid tool selected, please select a valid tool name.\n')
    else:
        sys.stderr.write( 'Please provide a project directory to evaluate using -d <dir>.\n')
        sys.exit()

if __name__ == '__main__':
    main(sys.argv[1:])
