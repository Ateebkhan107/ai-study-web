#!/usr/bin/env python3
"""Extract the rendered Jarvis question cards into reviewable JSON.

This is intentionally only a source extractor.  The site's question order is not
the order used by our eSaral PDFs, so its output must be aligned and audited
before it can be passed to the publisher.
"""

from __future__ import annotations

import argparse
import html
import json
from html.parser import HTMLParser
from pathlib import Path


class Node:
    def __init__(self, tag="root", attrs=None, parent=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.parent = parent
        self.children = []


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in {"img", "br", "meta", "link", "input", "hr"}:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def classes(node):
    return set(node.attrs.get("class", "").split())


def descendants(node, tag=None):
    for child in node.children:
        if isinstance(child, str):
            continue
        if tag is None or child.tag == tag:
            yield child
        yield from descendants(child, tag)


def first(node, tag=None, required_class=None):
    for child in descendants(node, tag):
        if required_class is None or required_class in classes(child):
            return child
    return None


def node_text(node):
    if isinstance(node, str):
        return node
    if "katex" in classes(node):
        annotation = first(node, "annotation")
        if annotation:
            value = "".join(node_text(child) for child in annotation.children).strip()
            return f"${value}$"
    value = "".join(node_text(child) for child in node.children)
    return " ".join(html.unescape(value).split())


def extract_article(fragment):
    parser = ArticleParser()
    parser.feed(fragment)
    article = first(parser.root, "article")
    header = first(article, "header")
    header_spans = [node_text(x) for x in descendants(header, "span") if "katex" not in classes(x)]
    subject = next((x for x in header_spans if x in {"Physics", "Chemistry", "Mathematics"}), "")
    question_node = first(article, "div", "watermark-jarvis")
    options_root = first(article, "ol")
    options = []
    if options_root:
        for li in [x for x in options_root.children if not isinstance(x, str) and x.tag == "li"]:
            spans = [x for x in li.children if not isinstance(x, str) and x.tag == "span"]
            value = node_text(spans[-1] if spans else li)
            options.append(value)
    correct = ""
    footer = first(article, "footer")
    if footer:
        strong = first(footer, "strong")
        if strong:
            correct = node_text(strong).strip().strip("()")
    image = first(article, "img")
    return {
        "source_number": int(article.attrs["id"][1:]),
        "subject": subject,
        "question": node_text(question_node),
        "options": options,
        "correct": correct,
        "source_image": image.attrs.get("src") if image else None,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("html", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--allow-incomplete", action="store_true")
    args = parser.parse_args()
    source = args.html.read_text(encoding="utf-8")
    starts = []
    cursor = 0
    while True:
        cursor = source.find('<article id="q', cursor)
        if cursor < 0:
            break
        starts.append(cursor)
        cursor += 12
    articles = []
    for index, start in enumerate(starts):
        end = starts[index + 1] if index + 1 < len(starts) else source.find("</section>", start)
        fragment = source[start:end]
        close = fragment.find("</article>")
        if close >= 0:
            articles.append(extract_article(fragment[: close + len("</article>")]))
    if len(articles) != 90 and not args.allow_incomplete:
        raise SystemExit(f"Expected 90 question cards, found {len(articles)}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(articles, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"questions": len(articles), "output": str(args.output)}))


if __name__ == "__main__":
    main()
