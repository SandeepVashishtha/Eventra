package com.eventra.service;

import org.springframework.stereotype.Service;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.logging.Logger;

/**
 * Allow-list SVG sanitizer based on real XML parsing.
 *
 * <p>The document is parsed with a hardened {@link DocumentBuilderFactory}
 * (no DTDs, no external entities, no XInclude), then rebuilt keeping only
 * allow-listed elements and attributes. Script-bearing elements, event
 * handler attributes and non-{@code http(s)}/{@code mailto}/local-fragment
 * URIs are dropped. Ill-formed documents are rejected.
 */
@Service
public class SvgSanitizationService {

    private static final Logger logger = Logger.getLogger(SvgSanitizationService.class.getName());

    private static final Set<String> ALLOWED_ELEMENTS = Set.of(
            "svg", "g", "defs", "symbol", "use", "image", "marker", "a",
            "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
            "text", "tspan", "textPath", "title", "desc",
            "linearGradient", "radialGradient", "stop", "pattern", "clipPath", "mask",
            "filter", "feGaussianBlur", "feOffset", "feColorMatrix", "feBlend",
            "feComposite", "feMerge", "feMergeNode", "switch"
    );

    private static final Set<String> ALLOWED_ATTRIBUTES = Set.of(
            "id", "class",
            "viewBox", "preserveAspectRatio", "xmlns", "version",
            "x", "y", "cx", "cy", "r", "rx", "ry", "width", "height",
            "x1", "y1", "x2", "y2", "dx", "dy", "d", "points", "offset",
            "fill", "fill-rule", "fill-opacity", "stroke", "stroke-width",
            "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
            "stroke-miterlimit", "stroke-opacity", "opacity",
            "transform", "clip-path", "clip-rule",
            "text-anchor", "font-size", "font-family", "font-weight", "font-style",
            "letter-spacing", "dominant-baseline", "alignment-baseline",
            "stop-color", "stop-opacity", "color", "shape-rendering", "text-rendering",
            "marker-start", "marker-mid", "marker-end", "overflow",
            "href", "xlink:href", "src"
    );

    private static final Set<String> URI_ATTRIBUTES = Set.of("href", "xlink:href", "src");

    private static final String XMLNS_NS = "http://www.w3.org/2000/xmlns/";

    public byte[] sanitizeSvgContent(byte[] rawSvgBytes) throws IllegalArgumentException {
        if (rawSvgBytes == null || rawSvgBytes.length == 0) {
            throw new IllegalArgumentException("SVG content is empty");
        }

        try {
            Document doc = parseSvg(rawSvgBytes);

            Element root = doc.getDocumentElement();
            String rootName = root != null ? (root.getLocalName() != null ? root.getLocalName() : root.getNodeName()) : null;
            if (root == null || !"svg".equals(rootName)) {
                throw new IllegalArgumentException("Not a valid SVG document");
            }

            sanitizeNode(doc, root);

            TransformerFactory tf = TransformerFactory.newInstance();
            tf.setFeature(javax.xml.XMLConstants.FEATURE_SECURE_PROCESSING, true);
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.ENCODING, StandardCharsets.UTF_8.name());
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(doc), new StreamResult(writer));

            return writer.toString().getBytes(StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse SVG: " + e.getMessage(), e);
        }
    }

    private Document parseSvg(byte[] rawSvgBytes) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setExpandEntityReferences(false);
        factory.setXIncludeAware(false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new ByteArrayInputStream(rawSvgBytes));
    }

    private void sanitizeNode(Document doc, Element element) {
        NamedNodeMap attributes = element.getAttributes();
        for (int i = attributes.getLength() - 1; i >= 0; i--) {
            Attr attr = (Attr) attributes.item(i);
            String name = attr.getNodeName();
            String value = attr.getValue();

            if (XMLNS_NS.equals(attr.getNamespaceURI())) {
                continue; // keep xmlns / xmlns:xlink declarations
            }

            String local = attr.getLocalName() != null ? attr.getLocalName() : name;
            if (local.startsWith("on")) {
                element.removeAttributeNode(attr);
                continue;
            }

            boolean allowed = ALLOWED_ATTRIBUTES.contains(name) || ALLOWED_ATTRIBUTES.contains(local);
            if (!allowed) {
                element.removeAttributeNode(attr);
                continue;
            }

            if (URI_ATTRIBUTES.contains(name) || URI_ATTRIBUTES.contains(local)) {
                if (!isSafeUri(element, value)) {
                    element.removeAttributeNode(attr);
                }
            }
        }

        NodeList children = element.getChildNodes();
        for (int i = children.getLength() - 1; i >= 0; i--) {
            Node child = children.item(i);
            if (child.getNodeType() == Node.ELEMENT_NODE) {
                Element childElement = (Element) child;
                String childName = childElement.getLocalName() != null
                        ? childElement.getLocalName()
                        : childElement.getNodeName();
                if (ALLOWED_ELEMENTS.contains(childName)) {
                    sanitizeNode(doc, childElement);
                } else {
                    element.removeChild(child);
                }
            } else if (child.getNodeType() == Node.TEXT_NODE
                    || child.getNodeType() == Node.CDATA_SECTION_NODE) {
                // re-wrap CDATA as plain text so no markup can be re-injected
                Text text = doc.createTextNode(child.getNodeValue());
                element.replaceChild(text, child);
            }
        }
    }

    private boolean isSafeUri(Element element, String value) {
        String uri = value.trim();
        if (uri.startsWith("#")) {
            return true; // local fragment reference
        }
        String tag = element.getLocalName() != null ? element.getLocalName() : element.getNodeName();
        if ("use".equalsIgnoreCase(tag)) {
            return false; // external <use> references can exfiltrate data; fragments only
        }
        String lower = uri.toLowerCase();
        return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("mailto:");
    }
}
