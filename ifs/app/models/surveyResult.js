const { Model } = require('objection');

class SurveyResult extends Model {
  /* Name getter */
  static get tableName() {
    return 'survey_result';
  }
  /* Relationships 
  static get relationMappings() {
    return {
      exposures: {
        relation: Model.HasManyRelation,
        modelClass: AnnouncementExposure,
        join: {
          from: 'announcements.id',
          to: 'announcement_exposure.announcementId'
        },
      },
    };
  };*/
};

module.exports = SurveyResult;