"use strict";
const classes = require("./classes");
const utils = require("./utils");
const INDENTATION_STRING = "    ";
const LINE_ENDING = "\r\n";
const regexes = require("./regexes");
const applyReplace = (input, [regex, replacement]) => {
    return input.replace(regex, replacement);
};
module.exports = {
    classDefinitionFormatting: function (input) {
        function indentationFunc(index) {
            return index > 0 ? 1 : 0;
        }
        let regex = new RegExp(regexes.classDefinition);
        if (input.match(regex) != null) {
            let classDefinition = input.match(regex)[0];
            let lines = classDefinition.split(LINE_ENDING);
            let result = lines
                .map((line, index) => [line.trim(), indentationFunc(index)])
                .map(([line, indentation]) => INDENTATION_STRING.repeat(indentation) + line + LINE_ENDING)
                .join("");
            return input.replace(regex, result);
        }
        else {
            return input;
        }
    },
    repeatedNewlineFormatting: function (input) {
        const regex = new RegExp(LINE_ENDING + LINE_ENDING + LINE_ENDING);
        let oldResult = input.replace(regex, LINE_ENDING + LINE_ENDING);
        let result = oldResult.replace(regex, LINE_ENDING + LINE_ENDING);
        while (result != oldResult) {
            oldResult = result;
            result = oldResult.replace(regex, LINE_ENDING + LINE_ENDING);
        }
        return result;
    },
    forLoopHeaderFormatting: function (input) {
        const regexes = [[new RegExp("for[ |\t]*\\(", "g"), "for ("]];
        return regexes.reduce(applyReplace, input);
    },
    ifHeaderFormatting: function (input) {
        const regexes = [[new RegExp("if[ |\t]*\\(", 'g'), "if ("]];
        return regexes.reduce(applyReplace, input);
    },
    switchHeaderFormatting: function (input) {
        const regexes = [
            [
                new RegExp("switch[ |\t]*\\([ |\t]*(.+?)[ |\t]*\\)", "g"),
                "switch ($1)",
            ],
        ];
        return regexes.reduce(applyReplace, input);
    },
    whileLoopHeader: function (input) {
        const regexes = [[new RegExp("while[ |\t]*\\(", "g"), "while ("]];
        return regexes.reduce(applyReplace, input);
    },
    forLoopOneLiner: function (input) {
        return input.replace(/(\bfor\b[ |\t]*\(.+\))[ |\t|\r|\n]*?([^{]+;)/, "$1{$2}");
    },
    whileLoopOneLiner: function (input) {
        return input.replace(/(\bwhile[ |\t]*\(.+\))[ |\t|\r|\n]*?([^{]*;)/, "$1{$2}");
    },
    ifOneLiner: function (input) {
        return input.replace(/(if[ |\t]*\(.+\))[ |\t|\r|\n]*?([^{]*;)/, "$1{$2}");
    },
    ifMultilineHeaderAlignment: function (input) {
        const regex = new RegExp("[ |\t]*if \\(([^;{}]|\n|\r|\\(|\\))+\\)", "g");
        const matches = input.match(regex);
        if (matches != null) {
            const replacements = matches.map((match) => {
                if (match.includes(LINE_ENDING)) {
                    const lines = match.split(LINE_ENDING);
                    return lines
                        .map((lineContent, index) => {
                        if (index > 0) {
                            if (index < lines.length - 1) {
                                return INDENTATION_STRING + lineContent + LINE_ENDING;
                            }
                            else {
                                return INDENTATION_STRING + lineContent;
                            }
                        }
                        else {
                            return lineContent + LINE_ENDING;
                        }
                    })
                        .join("");
                }
                else {
                    return match;
                }
            });
            const matchesVsReplacements = utils
                .zip(matches, replacements)
                .filter(([match, replacement]) => match != replacement);
            var result = input;
            matchesVsReplacements.forEach(([match, replacement]) => {
                result = result.replace(match, replacement);
            });
            return result;
        }
        else {
            return input;
        }
    },
    curlyBracesLineSplitting: function (input) {
        const lines = input.split(LINE_ENDING);
        const regex1 = /([\S]+.*)\{/;
        const regex2 = /\{(.*?[\S]+)/;
        const regex3 = /([\S]+.*)\}/;
        const regex4 = /\}(.*?[\S]+)/;
        const allLines = lines.flatMap((line) => {
            const result1 = line.replace(regex1, "$1" + LINE_ENDING + "{");
            const result2 = result1.replace(regex2, "{" + LINE_ENDING + "$1");
            const result3 = result2.replace(regex3, "$1" + LINE_ENDING + "}");
            const result4 = result3.replace(regex4, "}" + LINE_ENDING + "$1");
            return result4.split(LINE_ENDING);
        });
        const allLinesWithEndings = allLines.map((line) => line + LINE_ENDING);
        const result = allLinesWithEndings.join("");
        return result;
    },
    lineIndentation: function (inputString) {
        var contentBlocks = [];
        var indentation = 0;
        var blockStart = 0;
        let input = Array.from(inputString);
        for (var i = 0; i < input.length; i++) {
            if (input[i] == "{") {
                if (blockStart != i - 1) {
                    contentBlocks.push(new classes.ContentBlock(indentation, blockStart, i - 1));
                }
                contentBlocks.push(new classes.ContentBlock(indentation, i - 1, i));
                blockStart = i;
                indentation = indentation + 1;
            }
            if (input[i] == "}") {
                if (blockStart != i - 1) {
                    contentBlocks.push(new classes.ContentBlock(indentation, blockStart, i - 1));
                }
                blockStart = i;
                indentation = indentation - 1;
                contentBlocks.push(new classes.ContentBlock(indentation, i - 1, i));
            }
        }
        contentBlocks.push(new classes.ContentBlock(indentation, blockStart, i));
        const splitIndexes = contentBlocks.map((c) => c.blockEnd);
        const indentations = contentBlocks.map((c) => c.indentation);
        let contentStrings = utils
            .splitArray(input, splitIndexes)
            .map((content) => content.join(""))
            .map((content) => content.replace(/^[\n|\r| ]*/, ""))
            .map((content) => content.replace(/[\n|\r| ]*$/, ""));
        let linesWithIndentation = utils
            .zip(contentStrings, indentations)
            .filter(([content, indentation]) => content != "")
            .flatMap(([content, indentation]) => {
            return content.split(LINE_ENDING).map((e) => [e, indentation]);
        });
        let additionalIndentation = linesWithIndentation.map((e) => 0);
        let result = linesWithIndentation
            .map(([line, indentation]) => {
            let pass0 = line.replace(/^[\n|\r| ]*/, "");
            let pass1 = pass0.replace(/[\n|\r| ]*$/, "");
            return INDENTATION_STRING.repeat(indentation) + pass1 + LINE_ENDING;
        })
            .join("");
        return result;
    },
};
//# sourceMappingURL=reducers.js.map