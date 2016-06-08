@ngdoc overview
@name myBi
@description

# EMC Insights

## Getting Started
To host this project:

1. install [node.js]
1. install [git]
1. allow access to git repositories through proxy: `git config --global url."https://".insteadOf git://`
1. install bower dependency manager: `npm install -g bower`
1. go into the project directory
1. `bower install`
1. `npm install --production` (most likely no action necessary)
1. host the project directory in a local or remote web server


### Development
In addition to the above steps, please do the following to get started developing:

1. install grunt task runner: `npm install -g grunt-cli`
1. go to the project directory
1. install dev dependencies: `npm install`
1. install [ruby], (make sure to check "Add Ruby executables to PATH)
1. force "gem" to use HTTP instead of HTTPS to work with SSL proxy
    * `gem sources --add http://rubygems.org`
    * `gem sources --remove https://rubygems.org/`
1. install compass: `gem install compass`
1. install yeoman: `npm install -g yo`
1. install angular-generator: `npm install -g generator-angular`

This project was created using Yeoman (`yo angular`).
Please refer to [angular-generator] documentation for more information.

Use Yeoman scripts to create new functionalities:

* create a route
	* `yo angular:router <route-name>`
* create a controller
	* `yo angular:controller <controller-name>`
* etc.

Use grunt for automated tasks:

* `grunt serve` - Run a development server with watch & livereload enabled.
* `grunt test` - Run local unit tests.
* `grunt build` - Places a fully optimized (minified, concatenated, and more) in /dist


Install additional angular packages

* `bower install <name> --save`
    * add package to index.html (and possible css)
    * add package to module dependencies in relevant module


## Project Description
EMC Insights is a single stop shop for users to access reports from various reporting tools. The tool provides a customized home page for users based on their business unit. 

### Features
* Easy to use landing page with recommended (business defined) tiles / reports
* Persona based access, communications.
* Reports Catalog Ð review all available reports and highlight favorites from various reporting tools.
* Operational Dashboard Ð Customized actionable KPI / Metrics, insights tiles, Dashboards, embedded content, etc.
* Personalisation Ð customizable landing page dashboards from suite of available content.
* Global search capability against various Reporting tools Metadata (Currently BOBJ/Tableau).
### Benefits
* Enterprise IT supported portal offering a persona driven analytics and insight experience
* Unified access across disparate reporting and visualization tools
* Business Unit configurable
* Designed to scale as user base adoption increases
* User personalization
* Self Service Reporting capabilities
* Reduce manual effort, increased efficiency and productivity
* Responsive design including mobile devices
* Platform for increased collaboration

You can find additional project documentation in the [Insights Help].

## Target Platforms
### Target Browsers
* IE9+
* modern desktop browsers (chrome, firefox, safari, IE10)
* mobile browsers (android, mobile safari) - Target's in future version/release.


### Target Devices
* desktop
* tablets (in particular iPad)
* phones (android, ios) - Target's in future version/release.

Deployment to mobile device will be done using the "Secure Browser" container by Mobility TCC.

## Technologies Used
The approach followed is a client-server architecture. The server supplies web services in JSON format and the client runs a single-page application consuming said web services.
This approach was chosen to make the mobile user experience as interactive and reactive as possible despite low bandwidth and high latency.

The client will be a Responsive HTML5 web application that renders well on desktops, tablets and phones.

On-client we are using the following frameworks/libraries:

* angular.js 1.4.2 (for MVC, templates, modules, data-binding)
	* angular-ui-router (nested views) 
* bootstrap 3 (for responsiveness)
* underscore 1.8.3 (for javascript enhancement)

In-development we are using the following tools:

* grunt (for task automation)
* SASS (for CSS preprocessing)
* ngdoc (for documentation; extension of jsdoc)


## Project Structure
In order to make use of the very mature [angular-generator], we use a sock-drawer structure.

While a structure of nested modules would be better (ngbp, cg-angular), we couldn't find a good yeoman
script to support this structure. We will probably refactor the structure at some point.


## Project Screens

A side menu acts as a central dashboard. And Top Search help users to users all reports 
The side menu & search are visible to all "Normal users".
Side menu contains 4 menus
* Home
    * Landing page of Users
        * Carousel banner - based on persona user belongs to
        * My level Indication - Based on user usage
        * Recommended Reports - based on persona user belongs to
        * Favorites - User tagged reports
        * Most Viewed Reports - Based on user usage
        * News & Popular Search - common all users
* Operational Dashboard
    * Based on persona user belongs to, html page will be loaded in iframe & link to persona will be added by admin/BUAdmin in admin application.
* Recommended Reports
    * Level's will be display as sub menu in tree structure.
        * Each level contains reports & which will be display in the body.
* My Favorites
    * All reports which are tagged as favorite by users are displayed.

## Packages/libraries used

* ngInfiniteScroll  (MIT)       - auto-complete text input
* bootstrap     (MIT)       - responsive CSS framework
* jQuery        (MIT)       - DOM manipulation
* angular       (MIT)       - client-side MVC framework
    * animate   - 
    * cookies   -
    * aria      -
    * sanitize  -
    * mocks     - mocking of browser apis that are hard to test
    * route     - routing
* angular-ui    (MIT)
    * bootstrap - bootstrap behavior integration
    * router    - nested views, state machine
    * utils     - swiss army knife

* Please check bower.json for more details.


[COMMENT]: <> (Please find resource URLs below)


[Insights Help]:        https://insights.corp.emc.com/doc/Insights%20User%20Documentation.pdf
[node.js]:              http://nodejs.org/
[git]:                  http://git-scm.com/
[angular-generator]:    https://github.com/yeoman/generator-angular
[ruby]:                 http://rubyinstaller.org/

