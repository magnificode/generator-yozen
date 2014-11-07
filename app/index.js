var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    shell = require('shelljs');

var ZenGen = module.exports = function ZenGen(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	this.on('end', function () {
	    this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
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
            message: 'The Site URL (e.g. 10.0.1.254:8888/sites/zenman/zenman)'
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
            message: 'Zenman Servers Password',
            default: 'root'
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
            message: 'Live Servers Database Password',
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

ZenGen.prototype.gruntFiles = function gruntFiles() {
    this.copy('_package.json', 'package.json');
    this.copy('_gulpfile.js', 'gulpfile.js');
};

ZenGen.prototype.LatestWordpress = function LatestWordpress() {
    var cb   = this.async();

    this.log.writeln('\n*************************************************\n** Downloading the latest Version of Wordpress **\n*************************************************');
    this.tarball('http://wordpress.org/latest.zip', './', cb);
};


ZenGen.prototype.removeThemes= function removeThemes() {

    this.log.writeln('\n*******************************************\n** Deleting the default Wordpress themes **\n*******************************************');
    shell.rm('-rf', './wp-content/themes/*');

};

ZenGen.prototype.Zemplate = function Zemplate() {

    if( this.installZemplate ){
        var cb   = this.async();

        this.log.writeln('\n*********************************************************************\n** Downloading and installing your theme **\n********************************************************************');
        this.tarball(this.installZemplate, 'wp-content/themes/' + this.themeName, cb);
    }else{
        var cb   = this.async();

        this.log.writeln('\n*********************************************************************\n** Downloading and installing your theme **\n********************************************************************');
        this.tarball('https://wordpress.org/themes/download/twentyfourteen.1.0.zip', 'wp-content/themes/' + this.themeName, cb);
    }

};

ZenGen.prototype.acfWordpress = function acfWordpress() {

    if( this.installAcf ){
        var cb   = this.async();

        this.log.writeln('\n*****************************************************************************************************\n** Installing the latest Advanced Custom Fields **\n*****************************************************************************************************');
        this.tarball('https://github.com/elliotcondon/acf/archive/master.tar.gz', 'wp-content/plugins/advanced-custom-fields', cb);
    }
};

ZenGen.prototype.yoastWordpress = function yoastWordpress() {

    if( this.installYoast){
        var cb   = this.async();

        this.log.writeln('\n*******************************************************************************************************************\n** Installing Yoast **\n*******************************************************************************************************************');
        this.tarball('https://github.com/Yoast/wordpress-seo/archive/master.tar.gz', 'wp-content/plugins/wordpress-seo', cb);
    }
};
// Update WP Config
ZenGen.prototype.updateWpConfig = function updateWpConfig() {
    shell.rm('-rf', './wp-config.php');
    this.log.writeln('\n*********************************\n** Updating the wp-config file **\n*********************************');
    this.copy('wp-config.php.tmpl', 'wp-config.php');
};
// Update Zen Config
ZenGen.prototype.updateWpConfig = function updateWpConfig() {
    this.log.writeln('\n*********************************\n** Adding the zen-config file **\n*********************************');
    this.copy('zen-config.php.tmpl', 'zen-config.php');
};

//move css template and update theme name
ZenGen.prototype.moveCss = function moveCss() {
    this.log.writeln('\n************************************\n** Adding theme name to style.css **\n************************************');
    shell.exec("sed -i -e 's/.*Theme Name.*/Theme Name: " + this.themeName + "/' ./wp-content/themes/" + this.themeName + "/style.css")
    shell.exec("rm -f -r ./wp-content/themes/" + this.themeName + "/style.css-e")
};

//Create database
ZenGen.prototype.CreateDatabase = function CreateDatabase() {

    this.log.writeln('\n***********************\n** Creating database **\n***********************');
    shell.exec('mysql --user="' + this.dbUser + '" --password="' + this.dbPass + '" -e "create database ' + this.dbName + '"');
};

//Install Wordpress
ZenGen.prototype.InstallWordpress = function InstallWordpress() {

    this.log.writeln('\n**************************\n** Installing Wordpress **\n**************************');
    shell.exec('curl -d "weblog_title=' + this.siteTitle + '&user_name=' + this.adminUser + '&admin_password=' + this.adminPassword + '&admin_password2=' + this.adminPassword + '&admin_email=' + this.adminEmail + '" http://' + this.siteURL + '/wp-admin/install.php?step=2')
};

//Update theme in database
ZenGen.prototype.UpdateThemeInDb = function UpdateThemeInDb() {

    this.log.writeln('\n********************************\n** Updating Theme in Database **\n********************************');

    shell.exec('mysql --user="' + this.dbUser + '" --password="' + this.dbPass + '" -D ' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'template\'"');
    shell.exec('mysql --user="' + this.dbUser + '" --password="' + this.dbPass + '" -D ' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'stylesheet\'"');
    shell.exec('mysql --user="' + this.dbUser + '" --password="' + this.dbPass + '" -D ' + this.dbName + ' -e "UPDATE wp_options SET option_value = \'' + this.themeName + '\' WHERE option_name = \'current_theme\'"');

};