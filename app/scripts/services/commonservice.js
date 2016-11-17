'use strict';

/**
 * @ngdoc service
 * @name myBiApp.commonService
 * @description
 * # commonService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
  .service('commonService', function commonService(WEBSERVICEURL) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    /**
    *prepare the user profile Url
    */
    this.prepareUserProfilePicUrl = function(entityId)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.userProfilePic, {'entityId':entityId});   
    };
    
    /**
    *prepare the user Info Url
    */
    this.prepareUserInfoUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.userInfo, {'username':username});   
    };
    
    /**
    *prepare the user communication Url
    */
    this.prepareUserCommunicationUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.homeBanner, {'username':username});   
    };
    
    /**
    *prepare the user Report Summary Url
    */
    this.prepareUserReportSummaryUrl = function(username)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportSummary, {'username':username});   
    };
    
    /**
    *prepare the user Report by ID Url
    */
    this.prepareUserReportUrl = function(username, reportid)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportByID, {'username':username, 'reportid':reportid});   
    };
    
    /**
    *prepare the user Report by ID Url for search
    */
    this.prepareUserReportUrlSearch = function(username, sourceReportId, sourceSystemName)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportByIDSearch, {'username':username, 'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName});   
    };
    
    /**
    *prepare the user reports from Level Url
    */
    this.prepareUserReportLevelUrl = function(username, groupid, levelid, offset, limit)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboardLevel, {'username':username, 'groupid':groupid, 'levelid':levelid, 'offset':offset, 'limit':limit});   
    };
    
    /**
    *prepare the group reports Url
    */
    this.prepareGroupReportUrl = function(username, groupid, offset, limit)  {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboardGroup, {'username':username, 'groupid':groupid, 'offset':offset, 'limit':limit});   
    };
    
    /**
    *prepare the user Role Details Url
    */
    this.prepareUserRoleDetailsUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.dashboard, {'username':username});
    };
    
    /**
    *prepare the user report Dashboard Url
    */
    this.prepareUserReportDashboardUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportDashboard, {'username':username});
    };
    
    /**
    *prepare the user update Favorite Url
    */
    this.prepareUserUpdateFavoriteUrl = function(username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.updateFavorite, {'username':username});
    };
    
    /**
    *prepare the favorite Reports Url
    */
    this.prepareFavoriteReportUrl = function(username, offset, limit) {
        return  this.replaceStringWithValues(WEBSERVICEURL.favoriteRepots, {'username':username, 'offset':offset, 'limit':limit});
    };
    
    /**
    *prepare the Search Url
    */
    this.prepareSearchUrl = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReports, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url with Filter
    */
    this.prepareSearchUrlFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the Search Url for persona
    */
    this.prepareSearchUrlPersona = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsPersona, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url for persona with Filter
    */
    this.prepareSearchUrlPersonaFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.searchReportsPersonaFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the Search Url for persona
    */
    this.prepareUserSearchUrlReports = function(username, offset, limit, texttobesearched) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userSearchallReports, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched});
    };
    
    /**
    *prepare the Search Url for persona with Filter
    */
    this.prepareUserSearchUrlReportsFilter = function(username, offset, limit, texttobesearched, filter) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userSearchallReportsFilter, {'username':username, 'offset':offset, 'limit':limit, 'texttobesearched':texttobesearched, 'filter':filter});
    };
    
    /**
    *prepare the get News Url
    */
    this.prepareGetNewsUrl = function(offset, limit) {
        return  this.replaceStringWithValues(WEBSERVICEURL.getNews, {'offset':offset, 'limit':limit});
    };
    
    /**
    *prepare the get Feedback Url
    */
    this.prepareFeedbackUrl = function(reportId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.feedbackList, {'reportId':reportId});
    };

    /**
    *prepare the get Metadata Url
    */
    this.prepareMetaDataUrl = function(offset, limit, sourceReportId, sourceSystem) {
        return  this.replaceStringWithValues(WEBSERVICEURL.metadata, {'offset':offset, 'limit':limit, 'sourceReportId':sourceReportId, 'sourceSystem':sourceSystem});
    };
    
    /**
    *prepare the get Metadata Url
    */
    this.prepareMetaDataUrlWork = function(offset, limit, sourceSystem, workbookId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.metadataWork, {'offset':offset, 'limit':limit, 'sourceSystem':sourceSystem, 'workbookId':workbookId});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.prepareReportAccessUrl = function(reportId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportAccess, {'reportId':reportId});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.prepareReportAccessUrlSearch = function(sourceReportId, sourceSystemName) {
        return  this.replaceStringWithValues(WEBSERVICEURL.reportAccessSearch, {'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName});
    };
    
    /**
    *prepare the get Report Access Url
    */
    this.preparegGetTableauTokenUrl = function(username, servername, siteid) {
        return  this.replaceStringWithValues(WEBSERVICEURL.getTableauToken, {'username':username, 'servername':servername,'siteid':siteid});
    };
 
    /**
    *prepare the Add Search Term Url
    */
    this.prepareAddSearchTermUrl = function() {
        return WEBSERVICEURL.addSearchTerm;
    };
  
    /**
    *prepare the Update Report Viewed Url
    */
    this.prepareUpdateReportViewedUrl = function(username, sourceReportId, sourceSystemName, type) {
        return  this.replaceStringWithValues(WEBSERVICEURL.updateReportViewed, {'username':username, 'sourceReportId':sourceReportId, 'sourceSystemName':sourceSystemName, 'type':type});
    };
    
    /**
    *prepare the Get User Persona Info Url
    */
    this.prepareGetUserPersonaInfoUrl = function() {
        return WEBSERVICEURL.userPersona;
    };
    
    /** 
    *Replace matching object keys in string with its values.
    */
    this.replaceStringWithValues = function(rString, replaceObject) {
        _.map(_.keys(replaceObject), function(key){
            rString = rString.replace(new RegExp(':'+key,'g'), replaceObject[key]);
        });
      return rString;  
    };
});
