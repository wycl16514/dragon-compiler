import React, { Component } from 'react'
import rangy from 'rangy/lib/rangy-selectionsaverestore';
import MonkeyLexer from './MonkeyLexer'
import * as bootstrap from 'react-bootstrap'

class MonkeyCompilerEditer extends Component {

    constructor(props) {
        super(props)
        this.keyWords = props.keyWords
        rangy.init()
        this.keyWordClass = 'keyword'
        this.keyWordElementArray = []
        this.identifierElementArray = []
        this.textNodeArray = []
        this.lineNodeClass = 'line'
        this.lineSpanNode = 'LineSpan'
        this.identifierClass = "Identifier"
        this.breakPointClass = "breakpoint"
        this.spanToTokenMap = {}
        this.initPopoverControl()
        this.keyToIngore = ["Enter", " ", "ArrowUp", "ArrowDown",
            "ArrowLeft", "ArrowRight"]
        // change 1
        var ruleClass1 = 'span.' + this.lineSpanNode + ':before'
        var rule = 'counter-increment: line;content: counter(line);display: inline-block;'
        rule += 'border-right: 1px solid #ddd;padding: 0 .5em;'
        rule += 'margin-right: .5em;color: #666;'
        rule += 'pointer-events:all;'
        //document.styleSheets[2].addRule(ruleClass1, rule);
        console.log("document style sheet:", document.styleSheets)
        document.styleSheets[1].insertRule(`${ruleClass1} {${rule}}`)
        this.bpMap = {}
        this.ide = null
    }

    initPopoverControl() {
        this.state = {}
        this.state.popoverStyle = {}
        this.state.popoverStyle.placement = "right"
        this.state.popoverStyle.positionLeft = -100
        this.state.popoverStyle.positionTop = -100
        this.state.popoverStyle.content = ""
        this.setState(this.state)
    }

    getContent() {
        return this.divInstance.innerText
    }

    changeNode(n) {
        var f = n.childNodes;
        for (var c in f) {
            this.changeNode(f[c]);
        }
        if (n.data) {
            this.lastBegin = 0
            n.keyWordCount = 0
            n.identifierCount = 0
            var lexer = new MonkeyLexer(n.data)
            this.lexer = lexer
            lexer.setLexingOberver(this, n)
            lexer.lexing()
        }
    }

    notifyTokenCreation(token, elementNode, begin, end) {
        var e = {}
        e.node = elementNode
        e.begin = begin
        e.end = end
        e.token = token

        if (this.keyWords[token.getLiteral()] !== undefined) {
            elementNode.keyWordCount++;
            this.keyWordElementArray.push(e)
        }

        if (elementNode.keyWordCount === 0 && token.getType() === this.lexer.IDENTIFIER) {
            elementNode.identifierCount++
            this.identifierElementArray.push(e)
        }
    }

    hightLightKeyWord(token, elementNode, begin, end) {
        var strBefore = elementNode.data.substr(this.lastBegin,
            begin - this.lastBegin)
        strBefore = this.changeSpaceToNBSP(strBefore)

        var textNode = document.createTextNode(strBefore)
        var parentNode = elementNode.parentNode
        parentNode.insertBefore(textNode, elementNode)
        this.textNodeArray.push(textNode)

        var span = document.createElement('span')
        span.style.color = 'green'
        span.classList.add(this.keyWordClass)
        span.appendChild(document.createTextNode(token.getLiteral()))
        parentNode.insertBefore(span, elementNode)

        this.lastBegin = end - 1

        elementNode.keyWordCount--
    }

    changeSpaceToNBSP(str) {
        var s = ""
        for (var i = 0; i < str.length; i++) {
            if (str[i] === ' ') {
                s += '\u00a0'
            }
            else {
                s += str[i]
            }
        }

        return s;
    }

    hightLightSyntax() {
        var i
        this.textNodeArray = []

        for (i = 0; i < this.keyWordElementArray.length; i++) {
            var e = this.keyWordElementArray[i]
            this.currentElement = e.node
            this.hightLightKeyWord(e.token, e.node,
                e.begin, e.end)

            if (this.currentElement.keyWordCount === 0) {
                var end = this.currentElement.data.length
                var lastText = this.currentElement.data.substr(this.lastBegin,
                    end)
                lastText = this.changeSpaceToNBSP(lastText)
                var parent = this.currentElement.parentNode
                var lastNode = document.createTextNode(lastText)
                parent.insertBefore(lastNode, this.currentElement)
                // 解析最后一个节点，这样可以为关键字后面的变量字符串设立popover控件
                this.textNodeArray.push(lastNode)
                parent.removeChild(this.currentElement)
            }
        }
        this.keyWordElementArray = []
    }

    getCaretLineNode() {
        var sel = document.getSelection()
        //得到光标所在行的node对象
        var nd = sel.anchorNode
        //查看其父节点是否是span,如果不是，
        //我们插入一个span节点用来表示光标所在的行
        var currentLineSpan = null;
        var elements = document.getElementsByClassName(this.lineSpanNode)
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i]
            if (element.contains(nd)) {
                currentLineSpan = element
            }
            while (element.classList.length > 0) {
                element.classList.remove(element.classList.item(0))
            }
            element.classList.add(this.lineSpanNode)
            element.classList.add(this.lineNodeClass + i)
        }

        if (currentLineSpan !== null) {
            // change 2
            currentLineSpan.onclick = function (e) {
                console.log("currentLineSpan onclick: ", e)
                //this.createBreakPoint(e.toElement)
                this.createBreakPoint(e.target)
            }.bind(this)
            return currentLineSpan
        }

        //计算一下当前光标所在节点的前面有多少个div节点，
        //前面的div节点数就是光标所在节点的行数
        var divElements = this.divInstance.childNodes;
        var l = 0;
        for (i = 0; i < divElements.length; i++) {
            if (divElements[i].tagName === 'DIV' &&
                divElements[i].contains(nd)) {
                l = i;
                break;
            }
        }

        var spanNode = document.createElement('span')
        spanNode.classList.add(this.lineSpanNode)
        spanNode.classList.add(this.lineNodeClass + l)
        // change 3
        spanNode.dataset.lineNum = l

        spanNode.onclick = function (e) {
            //this.createBreakPoint(e.toElement)
            this.createBreakPoint(e.target)
        }.bind(this)

        nd.parentNode.replaceChild(spanNode, nd)
        spanNode.appendChild(nd)
        return spanNode
    }
    // change 3
    setIDE(ide) {
        this.ide = ide
    }


    createBreakPoint(elem) {
        console.log("create break point for elem: ", elem)
        if (elem.classList.item(0) != this.lineSpanNode) {
            return
        }
        //是否已存在断点，是的话就取消断点
        if (elem.dataset.bp === "true") {
            var bp = elem.previousSibling
            bp.remove()
            elem.dataset.bp = false
            delete this.bpMap['' + elem.dataset.lineNum]
            if (this.ide != null) {
                this.ide.upddateBreakPointMap(this.bpMap)
            }
            return
        }

        //构造一个红色圆点
        elem.dataset.bp = true
        this.bpMap['' + elem.dataset.lineNum] = elem.dataset.lineNum
        var bp = document.createElement('span')
        bp.style.height = '10px'
        bp.style.width = '10px'
        bp.style.backgroundColor = 'red'
        bp.style.borderRadius = '50%'
        bp.style.display = 'inline-block'
        bp.classList.add(this.breakPointClass)
        elem.parentNode.insertBefore(bp, elem.parentNode.firstChild)
        if (this.ide != null) {
            this.ide.updateBreakPointMap(this.bpMap)
        }
    }

    handleIdentifierOnMouseOver(e) {
        e.currentTarget.isOver = true
        var token = e.currentTarget.token
        this.state.popoverStyle.positionLeft = e.clientX + 5
        this.state.popoverStyle.positionTop = e.currentTarget.offsetTop - e.currentTarget.offsetHeight
        this.state.popoverStyle.title = "Syntax"
        this.state.popoverStyle.content = "name:" + token.getLiteral() + "\nType:" + token.getType()

        // change
        if (this.ide != null) {
            var env = this.ide.getSymbolInfo(token.getLiteral())
            if (env) {
                this.state.popoverStyle.title = token.getLiteral()
                this.state.popoverStyle.content = env
            }
        }

        this.setState(this.state)
    }

    handleIdentifierOnMouseOut(e) {
        this.initPopoverControl()
    }

    addPopoverSpanToIdentifier(token, elementNode, begin, end) {
        var strBefore = elementNode.data.substr(this.lastBegin,
            begin - this.lastBegin)
        strBefore = this.changeSpaceToNBSP(strBefore)
        var textNode = document.createTextNode(strBefore)
        var parentNode = elementNode.parentNode
        parentNode.insertBefore(textNode, elementNode)

        var span = document.createElement('span')
        span.onmouseenter = (this.handleIdentifierOnMouseOver).bind(this)
        span.onmouseleave = (this.handleIdentifierOnMouseOut).bind(this)
        span.classList.add(this.identifierClass)
        span.appendChild(document.createTextNode(token.getLiteral()))
        span.token = token
        parentNode.insertBefore(span, elementNode)
        this.lastBegin = end - 1
        elementNode.identifierCount--
    }

    addPopoverByIdentifierArray() {
        //该函数的逻辑跟hightLightSyntax一摸一样
        for (var i = 0; i < this.identifierElementArray.length; i++) {
            //用 span 将每一个变量包裹起来，这样鼠标挪上去时就可以弹出popover控件
            var e = this.identifierElementArray[i]
            this.currentElement = e.node
            //找到每个IDENTIFIER类型字符串的起始和末尾，给他们添加span标签
            this.addPopoverSpanToIdentifier(e.token, e.node,
                e.begin, e.end)

            if (this.currentElement.identifierCount === 0) {
                var end = this.currentElement.data.length
                var lastText = this.currentElement.data.substr(this.lastBegin,
                    end)
                lastText = this.changeSpaceToNBSP(lastText)
                var parent = this.currentElement.parentNode
                var lastNode = document.createTextNode(lastText)
                parent.insertBefore(lastNode, this.currentElement)
                parent.removeChild(this.currentElement)
            }
        }

        this.identifierElementArray = []
    }

    preparePopoverForIdentifers() {
        if (this.textNodeArray.length > 0) {
            //fix bug
            this.identifierElementArray = []
            for (var i = 0; i < this.textNodeArray.length; i++) {
                //将text 节点中的文本提交给词法解析器抽取IDENTIFIER
                this.changeNode(this.textNodeArray[i])
                //为解析出的IDENTIFIER字符串添加鼠标取词功能
                this.addPopoverByIdentifierArray()
            }
            this.textNodeArray = []
        } else {
            this.addPopoverByIdentifierArray()
        }

    }

    hightlineByLine(line, hightLine) {
        var lineClass = this.lineNodeClass + line
        var spans = document.getElementsByClassName(lineClass)
        // change 4
        if (spans !== null && hightLine == true) {
            var span = spans[0]
            span.style.backgroundColor = 'yellow'
            var arrow = document.createElement("span")
            arrow.classList.add("glyphicon")
            arrow.classList.add("glyphicon-circle-arrow-right")
            arrow.classList.add("ArrowRight")
            span.parentNode.insertBefore(arrow, span)
        }

        if (spans !== null && hightLine == false) {
            var span = spans[0]
            span.style.backgroundColor = 'white'
            var arrow = document.getElementsByClassName('ArrowRight')
            if (arrow !== undefined) {
                arrow[0].parentNode.removeChild(arrow[0])
            }
        }
    }

    onDivContentChane(evt) {
        if (this.keyToIngore.indexOf(evt.key) >= 0) {
            return;
        }

        var bookmark = undefined
        if (evt.key !== 'Enter') {
            bookmark = rangy.getSelection().getBookmark(this.divInstance)
        }

        //change here
        var currentLine = this.getCaretLineNode()
        for (var i = 0; i < currentLine.childNodes.length; i++) {
            if (currentLine.childNodes[i].className
                === this.keyWordClass ||
                currentLine.childNodes[i].className === this.identifierClass) {
                var child = currentLine.childNodes[i]
                var t = document.createTextNode(child.innerText)
                currentLine.replaceChild(t, child)
            }
        }

        //把所有相邻的text node 合并成一个
        currentLine.normalize();
        this.identifierElementArray = []
        this.changeNode(currentLine)
        this.hightLightSyntax()
        this.preparePopoverForIdentifers()

        if (evt.key !== 'Enter') {
            rangy.getSelection().moveToBookmark(bookmark)
        }

    }

    onClickDiv() {
        /*
        只有把pointerEvents设置为none，我们才能抓取鼠标在每行
        数字处点击的信息，但是设置后mouseenter消息就不能接收到
        于是当我们把鼠标挪到变量上方时，无法显现popover
        */
        var lineSpans = document.getElementsByClassName(this.lineSpanNode)
        for (var i = 0; i < lineSpans.length; i++) {
            lineSpans[i].style.pointerEvents = 'none'
        }
    }

    onMouseEnter() {
        /*
        要想让popover控件出现，必须接收mouseenter时间，
        只有把pointerEvent设置为空而不是none时，这个时间才能传递给
        span
        */
        var lineSpans = document.getElementsByClassName(this.lineSpanNode)
        for (var i = 0; i < lineSpans.length; i++) {
            lineSpans[i].style.pointerEvents = ''
        }
    }

    render() {
        let textAreaStyle = {
            height: 480,
            border: "1px solid black",
            counterReset: 'line',
            fontFamily: 'monospace'
        };
        return (
            <div>
                <div style={textAreaStyle}
                    onKeyUp={this.onDivContentChane.bind(this)}
                    ref={(ref) => { this.divInstance = ref }}
                    contentEditable>

                </div>

                <bootstrap.Popover placement={this.state.popoverStyle.placement}
                    positionLeft={this.state.popoverStyle.positionLeft}
                    positionTop={this.state.popoverStyle.positionTop}
                    title={this.state.popoverStyle.title}
                    id="identifier-show"
                >
                    {this.state.popoverStyle.content}
                </bootstrap.Popover>
            </div>
        );
    }
}

export default MonkeyCompilerEditer