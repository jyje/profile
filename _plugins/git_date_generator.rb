# Jekyll plugin to set created_at and updated_at dates from Git commits
# Sets post.created_at and post.updated_at based on Git commit history
# Does NOT modify post.date (designated date)

require 'date'
require 'open3'

module Jekyll
  class GitDateGenerator < Generator
    safe true
    priority :lowest

    def generate(site)
      config = site.config['git_date'] || {}
      return unless config.fetch('enabled', true)

      use_git = config.fetch('use_git', true)
      fallback_to_filesystem = config.fetch('fallback_to_filesystem', true)
      collections = config.fetch('collections', ['posts', 'works', 'certifications', 'articles'])

      collections.each do |collection_name|
        collection = site.collections[collection_name]
        next unless collection

        collection.docs.each do |doc|
          set_git_dates(doc, use_git, fallback_to_filesystem)
        end
      end

      # Also process regular posts
      site.posts.docs.each do |post|
        set_git_dates(post, use_git, fallback_to_filesystem)
      end
    end

    private

    def set_git_dates(doc, use_git, fallback_to_filesystem)
      file_path = doc.path

      if use_git
        created_at = get_git_first_commit_date(file_path)
        updated_at = get_git_last_commit_date(file_path)
      else
        created_at = nil
        updated_at = nil
      end

      # Fallback to filesystem dates if Git failed or use_git is false
      if fallback_to_filesystem
        if created_at.nil?
          created_at = get_filesystem_created_date(file_path)
        end
        if updated_at.nil?
          updated_at = get_filesystem_modified_date(file_path)
        end
      end

      # Set the dates if we have them
      doc.data['created_at'] = created_at if created_at
      doc.data['updated_at'] = updated_at if updated_at
    end

    def get_git_first_commit_date(file_path)
      # Get the first commit date for this file
      # Using --follow to track file renames
      # Using --reverse to get oldest first
      cmd = "git log --format='%ai' --follow --reverse -- '#{file_path}' | head -1"
      
      begin
        output, status = Open3.capture2e(cmd)
        if status.success? && !output.strip.empty?
          date_str = output.strip
          return parse_date(date_str)
        end
      rescue => e
        Jekyll.logger.warn "GitDateGenerator:", "Failed to get first commit date for #{file_path}: #{e.message}"
      end
      
      nil
    end

    def get_git_last_commit_date(file_path)
      # Get the last commit date for this file
      # Using --follow to track file renames
      cmd = "git log --format='%ai' --follow -- '#{file_path}' | head -1"
      
      begin
        output, status = Open3.capture2e(cmd)
        if status.success? && !output.strip.empty?
          date_str = output.strip
          return parse_date(date_str)
        end
      rescue => e
        Jekyll.logger.warn "GitDateGenerator:", "Failed to get last commit date for #{file_path}: #{e.message}"
      end
      
      nil
    end

    def get_filesystem_created_date(file_path)
      return nil unless File.exist?(file_path)
      
      begin
        # Get file creation time (birth time)
        stat = File.stat(file_path)
        # On some systems, birthtime might not be available
        created_time = stat.respond_to?(:birthtime) ? stat.birthtime : stat.mtime
        return created_time
      rescue => e
        Jekyll.logger.warn "GitDateGenerator:", "Failed to get filesystem created date for #{file_path}: #{e.message}"
      end
      
      nil
    end

    def get_filesystem_modified_date(file_path)
      return nil unless File.exist?(file_path)
      
      begin
        stat = File.stat(file_path)
        return stat.mtime
      rescue => e
        Jekyll.logger.warn "GitDateGenerator:", "Failed to get filesystem modified date for #{file_path}: #{e.message}"
      end
      
      nil
    end

    def parse_date(date_str)
      # Parse ISO 8601 format: "2025-02-07 01:36:25 +0900"
      # Try multiple date formats
      formats = [
        '%Y-%m-%d %H:%M:%S %z',  # ISO 8601 with timezone
        '%Y-%m-%d %H:%M:%S',     # ISO 8601 without timezone
        '%Y-%m-%d',              # Date only
      ]

      formats.each do |format|
        begin
          return DateTime.strptime(date_str, format).to_time
        rescue ArgumentError
          next
        end
      end

      # Fallback to standard parsing
      begin
        return DateTime.parse(date_str).to_time
      rescue => e
        Jekyll.logger.warn "GitDateGenerator:", "Failed to parse date: #{date_str}"
        return nil
      end
    end
  end
end

