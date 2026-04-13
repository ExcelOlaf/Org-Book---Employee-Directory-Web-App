# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 2 |
| Low | 5 |
| Informational | 4 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP warnings logged - see the zap.log file for details | 3    |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of responses with status code 2xx | 100 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with content type application/javascript | 30 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with content type application/manifest+json | 10 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with content type image/svg+xml | 10 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with content type text/css | 10 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with content type text/html | 40 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Count of total endpoints | 10    |
| Info | Informational | https://d2ywwchq35tdbl.cloudfront.net | Percentage of slow responses | 75 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| CSP: Wildcard Directive | Medium | 3 |
| CSP: style-src unsafe-inline | Medium | 5 |
| Cross-Origin-Embedder-Policy Header Missing or Invalid | Low | 5 |
| Cross-Origin-Opener-Policy Header Missing or Invalid | Low | 5 |
| Cross-Origin-Resource-Policy Header Missing or Invalid | Low | Systemic |
| Server Leaks Version Information via "Server" HTTP Response Header Field | Low | Systemic |
| Timestamp Disclosure - Unix | Low | Systemic |
| Modern Web Application | Informational | 5 |
| Re-examine Cache-control Directives | Informational | 4 |
| Retrieved from Cache | Informational | 5 |
| Storable and Cacheable Content | Informational | Systemic |




## Alert Detail



### [ CSP: Wildcard Directive ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src`
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src`
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
img-src`


Instances: 3

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: style-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Medium (High)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Content-Security-Policy`
  * Attack: ``
  * Evidence: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 5

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://web.dev/articles/csp#resource-options ](https://web.dev/articles/csp#resource-options)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Cross-Origin-Embedder-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Embedder-Policy header is a response header that prevents a document from loading any cross-origin resources that don't explicitly grant the document permission (using CORP or CORS).

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Embedder-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 5

### Solution

Ensure that the application/web server sets the Cross-Origin-Embedder-Policy header appropriately, and that it sets the Cross-Origin-Embedder-Policy header to 'require-corp' for documents.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Embedder-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-embedder-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Cross-Origin-Opener-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Opener-Policy header is a response header that allows a site to control if others included documents share the same browsing context. Sharing the same browsing context with untrusted documents might lead to data leak.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Opener-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 5

### Solution

Ensure that the application/web server sets the Cross-Origin-Opener-Policy header appropriately, and that it sets the Cross-Origin-Opener-Policy header to 'same-origin' for documents.
'same-origin-allow-popups' is considered as less secured and should be avoided.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Opener-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-opener-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Cross-Origin-Resource-Policy Header Missing or Invalid ](https://www.zaproxy.org/docs/alerts/90004/)



##### Low (Medium)

### Description

Cross-Origin-Resource-Policy header is an opt-in header designed to counter side-channels attacks like Spectre. Resource should be specifically set as shareable amongst different origins.

* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/registerSW.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/registerSW.js`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `Cross-Origin-Resource-Policy`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that the application/web server sets the Cross-Origin-Resource-Policy header appropriately, and that it sets the Cross-Origin-Resource-Policy header to 'same-origin' for all web pages.
'same-site' is considered as less secured and should be avoided.
If resources must be shared, set the header to 'cross-origin'.
If possible, ensure that the end user uses a standards-compliant and modern web browser that supports the Cross-Origin-Resource-Policy header (https://caniuse.com/mdn-http_headers_cross-origin-resource-policy).

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 14

#### Source ID: 3

### [ Server Leaks Version Information via "Server" HTTP Response Header Field ](https://www.zaproxy.org/docs/alerts/10036/)



##### Low (High)

### Description

The web/application server is leaking version information via the "Server" HTTP response header. Access to such information may facilitate attackers identifying other vulnerabilities your web/application server is subject to.

* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `AmazonS3`
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `AmazonS3`
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `AmazonS3`
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/registerSW.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/registerSW.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `AmazonS3`
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `AmazonS3`
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to suppress the "Server" header or provide generic details.

### Reference


* [ https://httpd.apache.org/docs/current/mod/core.html#servertokens ](https://httpd.apache.org/docs/current/mod/core.html#servertokens)
* [ https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff648552(v=pandp.10) ](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff648552(v=pandp.10))
* [ https://www.troyhunt.com/shhh-dont-let-your-response-headers/ ](https://www.troyhunt.com/shhh-dont-let-your-response-headers/)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Timestamp Disclosure - Unix ](https://www.zaproxy.org/docs/alerts/10096/)



##### Low (Low)

### Description

A timestamp was disclosed by the application/web server. - Unix

* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1508970993`
  * Other Info: `1508970993, which evaluates to: 2017-10-25 22:36:33.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1555081692`
  * Other Info: `1555081692, which evaluates to: 2019-04-12 15:08:12.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1899447441`
  * Other Info: `1899447441, which evaluates to: 2030-03-11 08:17:21.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1925078388`
  * Other Info: `1925078388, which evaluates to: 2031-01-01 23:59:48.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-pZqKKP8l.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `1996064986`
  * Other Info: `1996064986, which evaluates to: 2033-04-02 14:29:46.`

Instances: Systemic


### Solution

Manually confirm that the timestamp data is not sensitive, and that the data cannot be aggregated to disclose exploitable patterns.

### Reference


* [ https://cwe.mitre.org/data/definitions/200.html ](https://cwe.mitre.org/data/definitions/200.html)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Informational (Medium)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="/libs/tree_maker-min.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="/libs/tree_maker-min.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="/libs/tree_maker-min.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="/libs/tree_maker-min.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `<script src="/libs/tree_maker-min.js"></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 5

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Informational (Low)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``


Instances: 4

### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Retrieved from Cache ](https://www.zaproxy.org/docs/alerts/10050/)



##### Informational (Medium)

### Description

The content was retrieved from a shared cache. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://d2ywwchq35tdbl.cloudfront.net
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Hit from cloudfront`
  * Other Info: ``
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 361`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 361`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/robots.txt
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 361`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `Age: 361`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`


Instances: 5

### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.rfc-editor.org/rfc/rfc9110.html ](https://www.rfc-editor.org/rfc/rfc9110.html)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/assets/index-BvLBBgjs.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/libs/tree_maker-min.css`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/manifest.webmanifest`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/registerSW.js
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/registerSW.js`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml
  * Node Name: `https://d2ywwchq35tdbl.cloudfront.net/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


