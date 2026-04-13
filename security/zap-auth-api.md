# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 1 |
| Informational | 1 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Percentage of responses with status code 2xx | 25 % |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Percentage of responses with status code 4xx | 75 % |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Percentage of endpoints with content type application/json | 100 % |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Percentage of endpoints with method GET | 100 % |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Count of total endpoints | 6    |
| Info | Informational | https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com | Percentage of slow responses | 50 % |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Strict-Transport-Security Header Not Set | Low | Systemic |
| Re-examine Cache-control Directives | Informational | 1 |




## Alert Detail



### [ Strict-Transport-Security Header Not Set ](https://www.zaproxy.org/docs/alerts/10035/)



##### Low (High)

### Description

HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.

* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees/730467
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees/730467`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/robots.txt
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/robots.txt`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/sitemap.xml
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/sitemap.xml`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to enforce Strict-Transport-Security.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)
* [ https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security ](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
* [ https://caniuse.com/stricttransportsecurity ](https://caniuse.com/stricttransportsecurity)
* [ https://datatracker.ietf.org/doc/html/rfc6797 ](https://datatracker.ietf.org/doc/html/rfc6797)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 15

#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Informational (Low)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees/730467
  * Node Name: `https://u3fn94z8c3.execute-api.us-east-2.amazonaws.com/prod/employees/730467`
  * Method: `GET`
  * Parameter: `cache-control`
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``


Instances: 1

### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3


