'use strict';

/**
 * @ngdoc service
 * @name myBiApp.WEBSERVICEURL
 * @description List of All webservices listed here
 * # WEBSERVICEURL
 * Constant in the myBiApp.
 */
angular.module('myBiApp')
.constant('WEBSERVICEURL', {
    'getUserDetails'        : 'BITool/getUserDetails',//
    'userInfo'              : 'BITool/userinfo/:username',//
    'userPersona'           : 'BITool/userExistInBITool/?userName=:username',//
    'dashboard'             : 'BITool/dashboard/:username',//
    'updateFavorite'        : 'BITool/report/updateFavorite/:username/',//
    'favoriteRepots'        : 'BITool/favoriteReports/:username/:offset/:limit',//
    'reportByID'            : 'BITool/report/id/:username/:reportid',//
    'reportByIDSearch'      : 'BITool/report/id/:username/:sourceReportId/:sourceSystemName',//
    'reportTileBigroup'     : 'BITool/reportTile/tile/MyBIRoleSFDC/biGroup',//
    'reportTileRoles'       : 'BITool/reportTile/tile/MyBIRoleSFDC/roles',//
    'reportTileAdd'         : 'BITool/reportTile/reportDashboard/addMyBIReportLink',//
    'homeBanner'            : 'BITool/communication/:username',//
    'getNews'               : 'BITool/getNews/:offset/:limit',//
    'popularSearch'         : 'BITool/popularSearch',//
    'reportDashboard'       : 'BITool/reportDashboard/:username',//
    'reportDashboardLevel'  : 'BITool/reportDashboard/report/level/:username/:groupid/:levelid/:offset/:limit',
    'reportDashboardGroup'  : 'BITool/reportDashboard/report/group/:username/:groupid/:offset/:limit',
    'reportSummary'         : 'BITool/report/reportSummary/:username',//
    'searchReports'         : 'BITool/userSearch/allReports/:username/:offset/:limit?searchText=:texttobesearched',
    'searchReportsFilter'   : 'BITool/userSearch/allReports/:username/:offset/:limit?:filter=:texttobesearched',
    'searchReportsPersona'  : 'BITool/searchReports/persona/:username/:offset/:limit?searchText=:texttobesearched',
    'searchReportsPersonaFilter'  : 'BITool/searchReports/persona/:username/:offset/:limit?:filter=:texttobesearched',
    'userSearchallReports'  : 'BITool/userSearch/allReports/:username/:offset/:limit?searchText=:texttobesearched',
    'userSearchallReportsFilter'  : 'BITool/userSearch/allReports/:username/:offset/:limit?:filter=:texttobesearched',
    'feedbackPost'          : 'BITool/addFeedback',
    'feedbackList'          : 'BITool/reportFeedbacks/:reportId',
    'reportAccess'          : 'BITool/reportAccess/:reportId',
    'reportAccessSearch'    : 'BITool/reportAccess/:sourceReportId/:sourceSystemName',
    /*'userProfilePic'      : 'https://ssgosgdev.isus.emc.com/dev/image-api/v1.0/images/:entityId?apikey=l7xx475c903f220c4aa2a0c1259a89afe4a8'//*/
    //this not an ajax call and '/' is not appended from app.js. So appended '/' to work same in www folder also
    'userProfilePic'        : '/BITool/getEmployeeImage/:entityId',
    'getTableauToken'       : 'BITool/getTrustedTicket/:username/:servername/:siteid',
    'addSearchTerm'         : 'BITool/addSearch',
    'updateReportViewed'    : 'BITool/report/updateReportViewed/:username/:sourceReportId/:sourceSystemName?type=:type'
});