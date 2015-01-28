/*------------------------------------*\
    ::So Basic.
\*------------------------------------*/
var util    = require('util'),
    path    = require('path'),
    yeoman  = require('yeoman-generator'),
    wp      = require('wp-util'),
    shell   = require('shelljs'),
    Config  = require('../util/config');

// Export the module
module.exports = ZenGen;

function ZenGen(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    // Load the config files
    this.conf = new Config();
};
util.inherits(ZenGen, yeoman.generators.Base);

ZenGen.prototype.askFor = function askFor() {
    var cb = this.async();

    // have Yeoman greet the user.
    console.log(this.yeoman);

    var prompts = [
        {
            type: 'input',
            name: 'siteTitle',
            message: 'Please enter the sites name/title'
        },
        {
            type: 'input',
            name: 'siteURL',
            message: 'The Site URL (e.g. 10.0.1.254:8888/sites/zenman/zenman)',
            default: 'localhost:8888/sites/_sandbox/generator-yozen'
        },
        {
            type: 'input',
            name: 'adminUser',
            message: 'The wordpress admin username (Will be used to login to Wordpress)',
            default: 'zenadmin'
        },
        {
            type: 'input',
            name: 'adminPassword',
            message: 'The wordpress admin password (Will be used to login to Wordpress)'
        },
        {
            type: 'input',
            name: 'adminEmail',
            message: 'The wordpress admin users email address'
        },
        {
            type: 'input',
            name: 'installZemplate',
            message: 'To install a third party theme, enter it\'s download URL. (Leave blank to continue without). Not installing another theme will set your grunt file up using the twentyfourteen theme',
            default: 'https://github.com/zenman/zemplate/archive/zemplate_3.1.zip'
        },
        {
            when: function (response) {
                return response.installZemplate;
            },
            type: 'input',
            name: 'themeName',
            message: 'Enter a name for your theme',
            default: ''
        },
        {
            type: 'confirm',
            name: 'installGoogXML',
            message: 'Would you like to install the Google XML Sitemap plugin?'
        },
        {
            type: 'confirm',
            name: 'installAcf',
            message: 'Would you like to install the Advanced Custom Fields plugin?'
        },
        {
            type: 'confirm',
            name: 'installYoast',
            message: 'Would you like to install the Yoast SEO plugin?'
        },
        {
            type: 'input',
            name: 'dbName',
            message: 'Zenman Servers Database Name and Database Username (will be the same)'
        },
        {
            type: 'input',
            name: 'dbPass',
            message: 'Zenman Servers Password'
        },
        {
            type: 'input',
            name: 'liveDbName',
            message: 'Live Servers Database Name',
            default: 'wp_live_db'
        },
        {
            type: 'input',
            name: 'liveDbUser',
            message: 'Live Servers Database Username',
            default: 'wp_live_db'
        },
        {
            type: 'input',
            name: 'liveDbPass',
            message: 'Live Servers Database Password',
            default: 'hackme123'
        },
        {
            type: 'input',
            name: 'liveDbHost',
            message: 'Live Servers Database Hostname',
            default: 'localhost'
        }
    ];

    this.prompt(prompts, function (props) {
        this.siteTitle = props.siteTitle;
        this.siteURL = props.siteURL;
        this.adminUser = props.adminUser;
        this.adminPassword = props.adminPassword;
        this.adminEmail = props.adminEmail;
        this.installAcf = props.installAcf;
        this.installYoast = props.installYoast;


        this.installZemplate = props.installZemplate;
        this.dbName = props.dbName;
        this.dbUser = props.dbUser;
        this.dbPass = props.dbPass;
        this.liveDbName = props.liveDbName;
        this.liveDbUser = props.liveDbUser;
        this.liveDbPass = props.liveDbPass;
        this.liveDbHost = props.liveDbHost;
        this.themeName = props.themeName;

        if(!this.themeName){
            this.themeName = this.siteTitle.toLowerCase().replace(/ /g, '-');
        }

        cb();

    }.bind(this));
};

ZenGen.prototype.gruntFiles = function() {
    this.copy('_package.json', 'package.json');
    this.copy('_gulpfile.js', 'gulpfile.js');
};

ZenGen.prototype.latestWordpress = function() {
    var cb   = this.async();
    this.log.writeln('\n*************************************************\n** Downloading the latest Version of Wordpress **\n*************************************************');
    this.tarball('http://wordpress.org/latest.zip', './', cb);
};

ZenGen.prototype.moveWP = function() {
    shell.mv('wordpress/*', './');
    shell.rm('-rf', './wordpress/');
};

ZenGen.prototype.removeThemes= function() {
    this.log.writeln('\n*******************************************\n** Deleting the default Wordpress themes **\n*******************************************');
    shell.rm('-rf', './wp-content/themes/*');
};

ZenGen.prototype.Zemplate = function() {

    if( this.installZemplate ){
        var cb   = this.async();

        this.log.writeln('\n*********************************************************************\n** Downloading and installing your theme **\n********************************************************************');
        this.tarball(this.installZemplate, 'wp-content/themes/', cb);
    }else{
        var cb   = this.async();

        this.log.writeln('\n*********************************************************************\n** Downloading and installing your theme **\n********************************************************************');
        this.tarball('https://wordpress.org/themes/download/twentyfourteen.1.0.zip', 'wp-content/themes/' , cb);
    }
};

ZenGen.prototype.moveTheme = function() {
    shell.mv('wp-content/themes/zemplate-zemplate_3.1/', 'wp-content/themes/' + this.themeName + '/');
};

ZenGen.prototype.acfWordpress = function() {
    if(this.installAcf ){
        var cb   = this.async();

        this.log.writeln('\n*****************************************************************************************************\n** Installing the latest Advanced Custom Fields **\n*****************************************************************************************************');
        this.tarball('https://github.com/elliotcondon/acf/archive/master.tar.gz', 'wp-content/plugins', cb);
    }
};

ZenGen.prototype.yoastWordpress = function() {
    if(this.installYoast){
        var cb   = this.async();

        this.log.writeln('\n*******************************************************************************************************************\n** Installing Yoast **\n*******************************************************************************************************************');
        this.tarball('https://github.com/Yoast/wordpress-seo/archive/master.tar.gz', 'wp-content/plugins', cb);
    }
};
ZenGen.prototype.gxmlWordpress = function() {
    if(this.installGoogXML){
        var cb   = this.async();

        this.log.writeln('\n*******************************************************************************************************************\n** Installing Google XML **\n*******************************************************************************************************************');
        this.tarball('https://downloads.wordpress.org/plugin/google-sitemap-generator.4.0.8.zip', 'wp-content/plugins', cb);
    }
};

//Create database
ZenGen.prototype.createDatabase = function() {
    this.log.writeln('\n***********************\n** Creating database **\n***********************');
    shell.exec('mysql --user="root" --password="root" -e "create database l1_' + this.dbName + '"');
};

// wp-config.php
ZenGen.prototype.muHaHaHaConfig = function() {

    var cb = this.async(),
        me   = this;

        me.log('Copying wp-config');
        me.template('wp-config.php.tmpl', 'wp-config.php');
        cb();

};

// zen-config.php
ZenGen.prototype.zenConf = function() {
    var cb = this.async(),
        me   = this;

        me.log('Copying wp-config');
        me.template('zen-config.php.tmpl', 'zen-config.php');
        cb();
};

//Install Wordpress
// ZenGen.prototype.InstallWordpress = function InstallWordpress() {
//     var cb = this.async();
//     this.log.writeln('\n**************************\n** Installing Wordpress **\n**************************');
//     shell.exec('wp core install --url='+this.siteURL+' --title='+this.siteTitle+' --admin_user='+this.adminUser+' --admin_password='+this.adminPassword+' --admin_email='+this.adminEmail);
//     cb();
// };

// // Create Faux WP Config with local info
// ZenGen.prototype.updateWpConfig = function updateWpConfig() {
//     shell.rm('-rf', './wp-config.php');
//     this.log.writeln('\n*********************************\n** Updating the wp-config file **\n*********************************');
//     this.copy('wp-config.php.tmpl', 'wp-config.php');
// };

// // Update WP Config
// ZenGen.prototype.updateWpConfig = function updateWpConfig() {
//     shell.rm('-rf', './wp-config.php');
//     this.log.writeln('\n*********************************\n** Updating the wp-config file **\n*********************************');
//     this.copy('wp-config.php.tmpl', 'wp-config.php');
// };
// // Update Zen Config
// ZenGen.prototype.updateZenConfig = function updateZenConfig() {
//     this.log.writeln('\n*********************************\n** Adding the zen-config file **\n*********************************');
//     this.copy('zen-config.php.tmpl', 'zen-config.php');
// };

//Update theme in database
// ZenGen.prototype.UpdateThemeInDb = function UpdateThemeInDb() {

//     this.log.writeln('\n********************************\n** Updating Theme in Database **\n********************************');

//     shell.exec('mysql --user="root" --password="root" -D l1_' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'template\'"');
//     shell.exec('mysql --user="root" --password="root" -D l1_' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'stylesheet\'"');
//     shell.exec('mysql --user="root" --password="root" -D l1_' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'current_theme\'"');

// };