# frozen_string_literal: true

# Jekyll plugin to set created_at and updated_at dates from Git commits
# Sets post.created_at and post.updated_at based on Git commit history
# Does NOT modify post.date (designated date)
#
# Similar to jekyll-last-modified-at but adds created_at (first commit date)

require 'date'
require 'open3'

module Jekyll
  module GitDate
    # Cache for git dates to avoid repeated git calls
    PATH_CACHE = {}
    REPO_CACHE = {}

    class Determinator
      attr_reader :site_source, :page_path, :type

      def initialize(site_source, page_path, type)
        @site_source = site_source
        @page_path = page_path
        @type = type # :created or :updated
      end

      def to_s
        to_time.strftime('%Y-%m-%d %H:%M:%S %z')
      end

      def to_time
        @time ||= determine_time
      end

      def to_liquid
        to_time
      end

      private

      def determine_time
        cache_key = "#{page_path}:#{type}"
        return PATH_CACHE[cache_key] if PATH_CACHE.key?(cache_key)

        time = if type == :created
                 git_first_commit_time || file_birthtime
               else
                 git_last_commit_time || file_mtime
               end

        PATH_CACHE[cache_key] = time
        time
      end

      def git_first_commit_time
        return nil unless git_repo?

        output = execute_git_command('--reverse')
        parse_git_output(output)
      end

      def git_last_commit_time
        return nil unless git_repo?

        output = execute_git_command('')
        parse_git_output(output)
      end

      def execute_git_command(extra_args)
        abs_path = File.expand_path(page_path)
        rel_path = abs_path.sub(site_source + '/', '')
        
        cmd = "cd '#{site_source}' && git log --format='%ai' --follow #{extra_args} -- '#{rel_path}' 2>/dev/null | head -1"
        
        begin
          output, status = Open3.capture2e(cmd)
          return output.strip if status.success? && !output.strip.empty?
        rescue => e
          Jekyll.logger.warn "GitDate:", "Git command failed: #{e.message}"
        end
        nil
      end

      def parse_git_output(output)
        return nil if output.nil? || output.empty?

        begin
          DateTime.strptime(output, '%Y-%m-%d %H:%M:%S %z').to_time
        rescue ArgumentError
          begin
            DateTime.parse(output).to_time
          rescue => e
            Jekyll.logger.warn "GitDate:", "Failed to parse date: #{output}"
            nil
          end
        end
      end

      def git_repo?
        return REPO_CACHE[site_source] if REPO_CACHE.key?(site_source)
        
        REPO_CACHE[site_source] = File.exist?(File.join(site_source, '.git'))
        REPO_CACHE[site_source]
      end

      def file_birthtime
        return nil unless File.exist?(page_path)
        
        stat = File.stat(page_path)
        stat.respond_to?(:birthtime) ? stat.birthtime : stat.mtime
      rescue => e
        nil
      end

      def file_mtime
        return nil unless File.exist?(page_path)
        
        File.stat(page_path).mtime
      rescue => e
        nil
      end
    end

    module Hook
      class << self
        def add_git_dates_proc
          proc { |item|
            config = item.site.config['git_date'] || {}
            next unless config.fetch('enabled', true)

            collections = config.fetch('collections', ['posts', 'works', 'certifications', 'articles'])
            
            # Check if this item is in a target collection
            collection_label = item.respond_to?(:collection) ? item.collection&.label : nil
            next unless collection_label.nil? || collections.include?(collection_label)

            site_source = item.site.source
            page_path = item.path

            # Set created_at if not already set
            unless item.data.key?('created_at')
              item.data['created_at'] = Determinator.new(site_source, page_path, :created)
            end

            # Set updated_at if not already set
            unless item.data.key?('updated_at')
              item.data['updated_at'] = Determinator.new(site_source, page_path, :updated)
            end
          }
        end
      end

      # Register hooks at module load time (like jekyll-last-modified-at)
      Jekyll::Hooks.register(:posts, :post_init, &Hook.add_git_dates_proc)
      Jekyll::Hooks.register(:pages, :post_init, &Hook.add_git_dates_proc)
      Jekyll::Hooks.register(:documents, :post_init, &Hook.add_git_dates_proc)
    end
  end
end
