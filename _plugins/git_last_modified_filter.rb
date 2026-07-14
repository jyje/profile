# frozen_string_literal: true

# Jekyll filter to get the last Git commit date for an arbitrary file path
# (e.g. a _data/*.yml file), unlike jekyll-last-modified-at and
# git_date_generator.rb which only track the current page/post/document.
# Usage: {{ "_data/resume-ko.yml" | git_last_modified: "%Y-%m-%d" }}

require_relative 'git_date_generator'

module Jekyll
  module GitLastModifiedFilter
    def git_last_modified(relative_path, format = '%Y-%m-%d')
      site = @context.registers[:site]
      abs_path = File.join(site.source, relative_path)
      Jekyll::GitDate::Determinator.new(site.source, abs_path, :updated).to_time.strftime(format)
    rescue StandardError => e
      Jekyll.logger.warn 'GitLastModifiedFilter:', "Failed for #{relative_path}: #{e.message}"
      ''
    end
  end
end

Liquid::Template.register_filter(Jekyll::GitLastModifiedFilter)
