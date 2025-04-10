class CreateSolidQueueTables < ActiveRecord::Migration[7.2]
  def change
    create_table :solid_queue_processes do |t|
      t.string :kind, null: false
      t.datetime :last_heartbeat_at, null: false
      t.bigint :supervisor_id
      t.string :pid, null: false
      t.string :hostname
      t.text :metadata

      t.timestamps

      t.index [:last_heartbeat_at]
      t.index [:supervisor_id]
    end

    create_table :solid_queue_jobs do |t|
      t.string :class_name, null: false
      t.text :arguments
      t.string :queue_name, null: false
      t.datetime :scheduled_at
      t.datetime :performed_at
      t.datetime :finished_at
      t.datetime :failed_at
      t.text :error_message
      t.string :active_job_id
      t.integer :priority, default: 0
      t.string :concurrency_key
      t.timestamps

      t.index :scheduled_at
      t.index :finished_at
      t.index [:queue_name, :finished_at]
    end

    create_table :solid_queue_ready_executions do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0
      t.datetime :created_at, null: false

      t.index [:priority, :job_id]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_scheduled_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0
      t.datetime :scheduled_at, null: false

      t.timestamps

      t.index [:scheduled_at, :priority]
      t.index [:queue_name, :scheduled_at]
    end

    create_table :solid_queue_ready_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0

      t.timestamps

      t.index [:priority, :job_id]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_claimed_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0
      t.references :process, null: false, foreign_key: { to_table: :solid_queue_processes }

      t.timestamps

      t.index [:process_id, :job_id]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_blocked_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0
      t.string :concurrency_key, null: false
      t.datetime :expires_at, null: false

      t.timestamps

      t.index [:expires_at, :concurrency_key]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_failed_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0

      t.timestamps

      t.index [:priority, :job_id]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_paused_jobs do |t|
      t.references :job, null: false, foreign_key: { to_table: :solid_queue_jobs }
      t.string :queue_name, null: false
      t.integer :priority, default: 0
      t.datetime :paused_at, null: false

      t.timestamps

      t.index [:priority, :job_id]
      t.index [:queue_name, :priority, :job_id]
    end

    create_table :solid_queue_semaphores do |t|
      t.string :key, null: false
      t.integer :value, default: 1, null: false
      t.datetime :expires_at, null: false

      t.timestamps

      t.index [:expires_at]
      t.index [:key, :value], unique: true
    end
  end
end
