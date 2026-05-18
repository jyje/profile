# Suppress harmless ECONNRESET / EPIPE noise from WEBrick during livereload.
# These errors occur when the browser closes a keep-alive connection while
# WEBrick is still reading — they are benign and do not affect functionality.
require 'webrick'

module WEBrick
  class BasicLog
    SUPPRESS = %w[ECONNRESET EPIPE EBADF Broken\ pipe].freeze

    alias_method :_orig_log, :log
    def log(level, data)
      return if level >= ERROR && SUPPRESS.any? { |s| data.to_s.include?(s) }
      _orig_log(level, data)
    end
  end
end
