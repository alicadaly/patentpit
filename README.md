Overview
--------
http://patentpit.com exposes a 'time machine' api for accessing US
patent ownership and ownership transfer data. The api answers questions
such as: "what were all patents transferred from Motorolla to Google and
when were they transferred", "who owned what / how many 'chocolate'
patents in 2014". Data is derived from records published by the USPTO.

GUI
---
The gui (this repo) is a demo / proof of concept, showing how to access
the service APIs. I'd love it if people who know how to make things
pretty helped out here! The gui is accessible at http://patentpit.com

API
---
    http://patentpit.com/api/transfers/docs?terms=google,motorola,2014
    http://patentpit.com/api/transfers/aggs?terms=google,motorola,2014
