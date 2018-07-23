const dbcfg = require('../config/databaseConfig');

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable(dbcfg.users_table, (t) => {
      t.increments('id').primary()
      t.string('username', 80).notNull()
      t.specificType('password', 'char(60)').notNull()
      t.integer('sessionId').notNull().defaultTo(0)
      t.boolean('optedIn').defaultTo(1)
    })
    .createTable(dbcfg.submission_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').unsigned().defaultTo(0).notNull()
      t.timestamp('date').defaultTo(knex.fn.now())  
    })
    .createTable(dbcfg.feedback_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').unsigned().notNull()
      t.integer('submissionId').unsigned().references('id').inTable('submission').notNull()
      t.text('toolName').notNull()
      t.text('filename').notNull()
      t.text('runType').notNull()
      t.text('type').notNull()
      t.text('route')
      t.integer('charPos').unsigned()
      t.integer('charNum').unsigned()
      t.integer('lineNum').unsigned()
      t.text('target')
      t.text('suggestions')
      t.text('feedback')
      t.text('severity')
      t.integer('hlBeginChar').unsigned()
      t.integer('hlEndChar').unsigned()
      t.integer('hlBeginLine').unsigned()
      t.integer('hlEndLine').unsigned()
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.student_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.text('name');
      t.text('bio')
    })
    .createTable(dbcfg.survey_table, (t) => {
      t.increments('id').primary()
      t.string('surveyName', 60).notNull().unique()
      t.string('authorNames', 60).notNull()
      t.string('title', 60)
      t.integer('totalQuestions')
      t.string('surveyField', 40).notNull()
      t.string('surveyFreq', 20).notNull()
      t.string('fullSurveyFile', 80).notNull()
    })
    .createTable(dbcfg.role_table, (t) => {
      t.increments('id').primary()
      t.string('role', 40).defaultTo('student').notNull()
    })
    .createTable(dbcfg.class_table, (t) => {
      t.increments('id').primary()
      t.string('code', 40).notNull().unique()
      t.text('name').defaultTo(null)
      t.text('description').defaultTo(null)
      t.enu('disciplineType', ['computer science', 'psychology', 'other'])
    })
    .createTable(dbcfg.assignment_table, (t) => {
      t.increments('id').primary()
      t.integer('classId').unsigned().references('id').inTable('class').notNull()
      t.text('name')
      t.text('title')
      t.text('description')
      t.dateTime('deadline').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.assignment_task_table, (t) => {
      t.increments('id').primary()
      t.integer('assignmentId').unsigned().references('id').inTable('assignment').notNull()
      t.text('name').defaultTo(null)
      t.text('description').defaultTo(null)
    })
    .createTable(dbcfg.class_skill_table, (t) => {
      t.increments('id').primary()
      t.integer('classId').unsigned().references('id').inTable('class').notNull()
      t.integer('assignmentId').unsigned().references('id').inTable('assignment')
      t.text('name').defaultTo(null)
      t.text('description').defaultTo(null)
    })
    .createTable(dbcfg.ifs_tips_table, (t) => {
      t.increments('id').primary()
      t.text('name').defaultTo(null)
      t.text('description').defaultTo(null)
    })
    .createTable(dbcfg.login_table, (t) => {
      t.increments('id').primary();
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').notNull().defaultTo(0);
      t.timestamp('timestamp').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.preferences_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.string('toolType', 60).notNull()
      t.string('toolName', 60).notNull()
      t.text('toolValue').notNull()
    })
    .createTable(dbcfg.question_table, (t) => {
      t.increments('id').primary()
      t.integer('surveyId').unsigned().references('id').inTable('survey').notNull()
      t.specificType('language', 'char(10)').notNull()
      t.integer('origOrder').unsigned().notNull()
      t.text('text').notNull()
      t.text('visualFile')
      t.enu('type', ['matrix', 'rating', 'text', 'radiogroup']).notNull()
    })
    .createTable(dbcfg.student_assignment_task_table, (t) => {
      t.increments('id').primary()
      t.integer('studentId').unsigned().references('id').inTable('student').notNull()
      t.integer('assignmentTaskId').unsigned().references('id').inTable('assignment_task').notNull()
      t.boolean('isComplete').defaultTo(0).notNull()
    })
    .createTable(dbcfg.student_class_table, (t) => {
      t.increments('id').primary();
      t.integer('studentId').unsigned().references('id').inTable('student').notNull()
      t.integer('classId').unsigned().references('id').inTable('class').notNull()
    })
    .createTable(dbcfg.student_skill_table, (t) => {
      t.increments('id').primary()
      t.integer('studentId').unsigned().references('id').inTable('student').notNull()
      t.integer('classSkillId').unsigned().references('id').inTable('class_skill')
      t.decimal('value', 4, 2)
      t.timestamp('lastRated').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.survey_preferences_table, (t) => {
      t.increments('id').primary()
      t.integer('surveyId').unsigned().references('id').inTable('survey').notNull()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.dateTime('surveyStartDate').defaultTo(knex.fn.now())
      t.timestamp('lastRevision').defaultTo(knex.fn.now())
      t.boolean('pauseAsking').defaultTo(0)
      t.time('pauseTime')
      t.boolean('allowedToAsk').defaultTo(1)
      t.integer('currentIndex').defaultTo(0)
      t.integer('lastIndex').defaultTo(10)
      t.integer('currentSurveyIndex').notNull().defaultTo(0)
    })
    .createTable(dbcfg.survey_results_table, (t) => {
      t.increments('id').primary()
      t.integer('surveyId').unsigned().references('id').inTable('survey').notNull()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('questionId').unsigned().references('id').inTable('questions').notNull()
      t.string('questionAnswer', 80).notNull()
      t.integer('surveyResponseId').notNull().defaultTo(0)
      t.timestamp('answeredOn').defaultTo(knex.fn.now())
      t.boolean('pulseResponse').defaultTo(0)
    })
    .createTable(dbcfg.upcoming_event_table, (t) => {
      t.increments('id').primary()
      t.integer('classId').unsigned().references('id').inTable('class').notNull()
      t.text('name')
      t.text('title')
      t.text('description')
      t.dateTime('openDate').defaultTo(knex.fn.now())
      t.dateTime('closedDate').defaultTo(knex.fn.now())
      t.timestamp('dateCreated').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.users_interation_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').unsigned().notNull()
      t.string('eventType', 40).notNull()
      t.string('name', 40).notNull()
      t.text('data').notNull()
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.user_registration_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.boolean('isRegistered').defaultTo(0)
      t.boolean('completedSetup').defaultTo(0)
    })
    .createTable(dbcfg.user_role_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('roleId').unsigned().references('id').inTable('roles').notNull()
    })
    .createTable(dbcfg.verify_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users')
      t.string('type', 10).notNull()
      t.string('token', 40).notNull()
      t.timestamp('timestamp').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.feedback_input_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('feedbackId').unsigned().references('id').inTable('feedback').notNull()
      t.text('input').notNull()
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.feedback_interaction_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').unsigned().defaultTo(0).notNull()
      t.integer('submissionId').unsigned().references('id').inTable('submission').onDelete('CASCADE').notNull()
      t.integer('feedbackId').unsigned().references('id').inTable('feedback').notNull()
      t.text('action').notNull()
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.feedback_rating_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('feedbackId').unsigned().references('id').inTable('feedback').onDelete('CASCADE').notNull()
      t.integer('ratingUp').unsigned().notNull()
      t.integer('ratingDown').unsigned().notNull()
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.feedback_stats_table, (t) => {
      t.increments('id').primary()
      t.integer('userId').unsigned().references('id').inTable('users').notNull()
      t.integer('sessionId').unsigned().notNull().defaultTo(0)
      t.integer('submissionId').unsigned().references('id').inTable('submission').notNull()
      t.text('filename').notNull()
      t.text('toolName').notNull()
      t.text('name').notNull()
      t.text('type').notNull()
      t.text('level').notNull()
      t.text('category').notNull()
      t.text('statName').notNull()
      t.decimal('statValue', 8, 3)
      t.timestamp('date').defaultTo(knex.fn.now())
    })
    .createTable(dbcfg.announcements_table, (t) => {
      t.increments('id').primary();
      t.string('title', 100).notNull();
      t.text('body').notNull();
      t.date('expiryDate').defaultTo(null);
      t.integer('classId').unsigned().references('id').inTable('class')
      t.timestamps(true, true);
    })
    .createTable(dbcfg.announcement_exposure_table, (t) => {
      t.increments('id').primary();
      t.integer('userId').unsigned().references('id').inTable('users')
      t.integer('announcementId').unsigned().references('id').inTable('announcements').onDelete('CASCADE')
      t.dateTime('viewDate').defaultTo(knex.fn.now());
    })
};

exports.down = function(knex, Promise) {
  
};
