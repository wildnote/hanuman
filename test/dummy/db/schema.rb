# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140706013616) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "hanuman_answer_choices", force: true do |t|
    t.integer  "question_id"
    t.string   "option_text"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "scientific_text"
    t.string   "ancestry"
  end

  add_index "hanuman_answer_choices", ["ancestry"], name: "index_hanuman_answer_choices_on_ancestry", using: :btree
  add_index "hanuman_answer_choices", ["question_id"], name: "index_hanuman_answer_choices_on_question_id", using: :btree

  create_table "hanuman_answer_types", force: true do |t|
    t.string   "name"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_observation_answers", force: true do |t|
    t.integer  "observation_id"
    t.integer  "answer_choice_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_observations", force: true do |t|
    t.integer  "survey_id"
    t.integer  "survey_question_id"
    t.text     "answer"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "group"
    t.integer  "answer_choice_id"
  end

  add_index "hanuman_observations", ["survey_id"], name: "index_hanuman_observations_on_survey_id", using: :btree
  add_index "hanuman_observations", ["survey_question_id"], name: "index_hanuman_observations_on_survey_question_id", using: :btree

  create_table "hanuman_organizations", force: true do |t|
    t.string   "name"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_questions", force: true do |t|
    t.text     "question_text"
    t.integer  "answer_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hanuman_questions", ["answer_type_id"], name: "index_hanuman_questions_on_answer_type_id", using: :btree

  create_table "hanuman_survey_extensions", force: true do |t|
    t.integer  "survey_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_survey_questions", force: true do |t|
    t.integer  "survey_template_id"
    t.integer  "question_id"
    t.integer  "sort_order"
    t.string   "group"
    t.boolean  "duplicator",         default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hanuman_survey_questions", ["question_id"], name: "index_hanuman_survey_questions_on_question_id", using: :btree
  add_index "hanuman_survey_questions", ["survey_template_id"], name: "index_hanuman_survey_questions_on_survey_template_id", using: :btree

  create_table "hanuman_survey_templates", force: true do |t|
    t.string   "name"
    t.string   "status"
    t.integer  "organization_id"
    t.string   "survey_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hanuman_survey_templates", ["organization_id"], name: "index_hanuman_survey_templates_on_organization_id", using: :btree

  create_table "hanuman_surveys", force: true do |t|
    t.integer  "survey_template_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "survey_date"
  end

  add_index "hanuman_surveys", ["survey_template_id"], name: "index_hanuman_surveys_on_survey_template_id", using: :btree

  create_table "versions", force: true do |t|
    t.string   "item_type",  null: false
    t.integer  "item_id",    null: false
    t.string   "event",      null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

end
