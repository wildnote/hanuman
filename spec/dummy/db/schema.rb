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

ActiveRecord::Schema.define(version: 20180928194840) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "hanuman_answer_choices", force: :cascade do |t|
    t.integer  "question_id"
    t.string   "option_text"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "scientific_text"
    t.string   "ancestry"
    t.integer  "sort_order"
  end

  add_index "hanuman_answer_choices", ["ancestry"], name: "index_hanuman_answer_choices_on_ancestry", using: :btree
  add_index "hanuman_answer_choices", ["question_id"], name: "index_hanuman_answer_choices_on_question_id", using: :btree

  create_table "hanuman_answer_types", force: :cascade do |t|
    t.string   "name"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "description"
    t.string   "descriptive_name"
    t.boolean  "has_answer_choices",   default: false, null: false
    t.string   "external_data_source"
    t.string   "answer_choice_type"
    t.string   "post_name"
    t.string   "post_type"
    t.string   "element_type"
    t.boolean  "has_an_answer",        default: true
    t.string   "group_type"
  end

  create_table "hanuman_conditions", force: :cascade do |t|
    t.integer  "question_id"
    t.string   "operator"
    t.string   "answer"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "rule_id"
  end

  add_index "hanuman_conditions", ["question_id"], name: "index_hanuman_conditions_on_question_id", using: :btree
  add_index "hanuman_conditions", ["rule_id"], name: "index_hanuman_conditions_on_rule_id", using: :btree

  create_table "hanuman_observation_answers", force: :cascade do |t|
    t.integer  "observation_id"
    t.integer  "answer_choice_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "multiselectable_id"
    t.string   "multiselectable_type"
  end

  create_table "hanuman_observation_documents", force: :cascade do |t|
    t.integer  "observation_id"
    t.string   "document"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sort_order"
  end

  add_index "hanuman_observation_documents", ["observation_id"], name: "index_hanuman_observation_documents_on_observation_id", using: :btree

  create_table "hanuman_observation_photos", force: :cascade do |t|
    t.integer  "observation_id"
    t.string   "photo"
    t.text     "description"
    t.float    "latitude"
    t.float    "longitude"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sort_order"
    t.integer  "width"
    t.integer  "height"
    t.float    "speed"
    t.float    "direction"
    t.float    "altitude"
  end

  add_index "hanuman_observation_photos", ["observation_id"], name: "index_hanuman_observation_photos_on_observation_id", using: :btree

  create_table "hanuman_observation_signatures", force: :cascade do |t|
    t.integer  "observation_id"
    t.string   "signature"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
  end

  add_index "hanuman_observation_signatures", ["observation_id"], name: "index_hanuman_observation_signatures_on_observation_id", using: :btree

  create_table "hanuman_observation_videos", force: :cascade do |t|
    t.integer  "observation_id"
    t.string   "video"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sort_order"
    t.float    "latitude"
    t.float    "longitude"
    t.float    "speed"
    t.float    "direction"
    t.float    "altitude"
  end

  add_index "hanuman_observation_videos", ["observation_id"], name: "index_hanuman_observation_videos_on_observation_id", using: :btree

  create_table "hanuman_observations", force: :cascade do |t|
    t.integer  "survey_id"
    t.text     "answer"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "entry"
    t.integer  "answer_choice_id"
    t.integer  "question_id"
    t.integer  "selectable_id"
    t.string   "selectable_type"
    t.string   "group_sort"
    t.integer  "repeater_id"
    t.integer  "parent_repeater_id"
    t.float    "latitude"
    t.float    "longitude"
    t.float    "speed"
    t.float    "direction"
    t.float    "altitude"
    t.integer  "sort_order"
  end

  add_index "hanuman_observations", ["survey_id"], name: "index_hanuman_observations_on_survey_id", using: :btree

  create_table "hanuman_questions", force: :cascade do |t|
    t.text     "question_text"
    t.integer  "answer_type_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "survey_step_id"
    t.integer  "sort_order"
    t.boolean  "required",                       default: false
    t.string   "external_data_source"
    t.string   "ancestry"
    t.boolean  "hidden",                         default: false
    t.integer  "duped_question_id"
    t.integer  "survey_template_id"
    t.text     "ancestry_children",              default: [],    array: true
    t.boolean  "capture_location_data",          default: false
    t.boolean  "combine_latlong_as_line",        default: false
    t.boolean  "combine_latlong_as_polygon",     default: false
    t.boolean  "noncompliance",                  default: false
    t.boolean  "enable_survey_history"
    t.boolean  "new_project_location"
    t.text     "default_answer"
    t.integer  "layout_section"
    t.integer  "layout_row"
    t.integer  "layout_column"
    t.string   "layout_column_position"
    t.integer  "export_continuation_characters"
    t.boolean  "searchable"
    t.integer  "max_photos"
  end

  add_index "hanuman_questions", ["ancestry"], name: "index_hanuman_questions_on_ancestry", using: :btree
  add_index "hanuman_questions", ["answer_type_id"], name: "index_hanuman_questions_on_answer_type_id", using: :btree
  add_index "hanuman_questions", ["survey_template_id"], name: "index_hanuman_questions_on_survey_template_id", using: :btree

  create_table "hanuman_rule_conditions", force: :cascade do |t|
    t.integer  "rule_id"
    t.integer  "condition_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hanuman_rule_conditions", ["condition_id"], name: "index_hanuman_rule_conditions_on_condition_id", using: :btree
  add_index "hanuman_rule_conditions", ["rule_id"], name: "index_hanuman_rule_conditions_on_rule_id", using: :btree

  create_table "hanuman_rules", force: :cascade do |t|
    t.integer  "question_id"
    t.string   "match_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "duped_rule_id"
  end

  add_index "hanuman_rules", ["question_id"], name: "index_hanuman_rules_on_question_id", using: :btree

  create_table "hanuman_settings", force: :cascade do |t|
    t.string   "key"
    t.string   "value"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_survey_extensions", force: :cascade do |t|
    t.integer  "survey_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hanuman_survey_templates", force: :cascade do |t|
    t.string   "name"
    t.string   "status"
    t.string   "survey_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "version"
    t.boolean  "lock"
    t.string   "description"
  end

  create_table "hanuman_surveys", force: :cascade do |t|
    t.integer  "survey_template_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date     "survey_date"
    t.string   "mobile_request_id"
    t.datetime "mobile_created_at"
    t.boolean  "observations_sorted"
  end

  add_index "hanuman_surveys", ["survey_template_id"], name: "index_hanuman_surveys_on_survey_template_id", using: :btree

  create_table "versions", force: :cascade do |t|
    t.string   "item_type",  null: false
    t.integer  "item_id",    null: false
    t.string   "event",      null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

  add_foreign_key "hanuman_observation_signatures", "hanuman_observations", column: "observation_id"
end
