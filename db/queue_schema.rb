# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2023_10_10_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "solid_queue_blocked_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at", "concurrency_key"], name: "idx_on_expires_at_concurrency_key_bcd1963a81"
    t.index ["job_id"], name: "index_solid_queue_blocked_jobs_on_job_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_3ef077b43c"
  end

  create_table "solid_queue_claimed_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.bigint "process_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_jobs_on_job_id"
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_jobs_on_process_id_and_job_id"
    t.index ["process_id"], name: "index_solid_queue_claimed_jobs_on_process_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_1af6f62830"
  end

  create_table "solid_queue_failed_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_jobs_on_job_id"
    t.index ["priority", "job_id"], name: "index_solid_queue_failed_jobs_on_priority_and_job_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_533eb06d50"
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "class_name", null: false
    t.text "arguments"
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "performed_at"
    t.datetime "finished_at"
    t.datetime "failed_at"
    t.text "error_message"
    t.string "active_job_id"
    t.integer "priority", default: 0
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_on_queue_name_and_finished_at"
    t.index ["scheduled_at"], name: "index_solid_queue_jobs_on_scheduled_at"
  end

  create_table "solid_queue_paused_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.datetime "paused_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_solid_queue_paused_jobs_on_job_id"
    t.index ["priority", "job_id"], name: "index_solid_queue_paused_jobs_on_priority_and_job_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_4c74f0b31c"
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.string "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id"
    t.index ["priority", "job_id"], name: "index_solid_queue_ready_executions_on_priority_and_job_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_b116c992cd"
  end

  create_table "solid_queue_ready_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_jobs_on_job_id"
    t.index ["priority", "job_id"], name: "index_solid_queue_ready_jobs_on_priority_and_job_id"
    t.index ["queue_name", "priority", "job_id"], name: "idx_on_queue_name_priority_job_id_4ac25efb77"
  end

  create_table "solid_queue_scheduled_jobs", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_jobs_on_job_id"
    t.index ["queue_name", "scheduled_at"], name: "idx_on_queue_name_scheduled_at_d495fac537"
    t.index ["scheduled_at", "priority"], name: "index_solid_queue_scheduled_jobs_on_scheduled_at_and_priority"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value", unique: true
  end

  add_foreign_key "solid_queue_blocked_jobs", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_claimed_jobs", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_claimed_jobs", "solid_queue_processes", column: "process_id"
  add_foreign_key "solid_queue_failed_jobs", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_paused_jobs", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_ready_jobs", "solid_queue_jobs", column: "job_id"
  add_foreign_key "solid_queue_scheduled_jobs", "solid_queue_jobs", column: "job_id"
end
