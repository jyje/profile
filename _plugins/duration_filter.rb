# Jekyll plugin to calculate duration between two dates
# Usage: {{ startDate | calculate_duration: endDate, lang, threshold }}
# If endDate is empty or {}, uses current date
# lang: 'ko' for Korean, 'en' for English (default)
# threshold: months threshold for year format (default: 14)

module Jekyll
  module DurationFilter
    def calculate_duration(start_date, end_date = nil, lang = 'en', threshold = 14)
      return '' if start_date.nil? || start_date.empty?
      
      begin
        start = Date.parse(start_date.to_s)
        end_date_obj = if end_date.nil? || end_date.to_s.empty? || end_date.to_s == '{}'
          Date.today
        else
          Date.parse(end_date.to_s)
        end
        
        # Calculate months difference
        months = (end_date_obj.year - start.year) * 12 + (end_date_obj.month - start.month)
        
        # Adjust for day difference
        if end_date_obj.day < start.day
          months -= 1
        end
        
        # Include both start and end month (add 1 month so e.g. 2025-02~2026-02 = 12 months / 1 year)
        months += 1
        
        # Convert threshold to integer
        threshold_months = threshold.to_i
        threshold_months = 14 if threshold_months <= 0  # Default to 14 if invalid
        
        # Format based on language and duration length
        if lang.to_s.downcase == 'ko'
          if months < threshold_months
            "#{months}개월"
          else
            years = months / 12
            remaining_months = months % 12
            if remaining_months == 0
              "#{years}년"
            else
              "#{years}년 #{remaining_months}개월"
            end
          end
        else
          if months < threshold_months
            "#{months} Month#{'s' if months != 1}"
          else
            years = months / 12
            remaining_months = months % 12
            if remaining_months == 0
              "#{years} Year#{'s' if years != 1}"
            else
              "#{years} Year#{'s' if years != 1} #{remaining_months} Month#{'s' if remaining_months != 1}"
            end
          end
        end
      rescue => e
        Jekyll.logger.warn "DurationFilter:", "Error calculating duration: #{e.message}"
        ''
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::DurationFilter)

