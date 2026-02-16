# frozen_string_literal: true

# Post-process _site/llms.txt: remove leading blank line, ensure one blank line
# after each H2, ensure exactly one trailing blank line.

Jekyll::Hooks.register(:site, :post_write) do |site|
  path = Jekyll.sanitized_path(site.dest, "llms.txt")
  next unless File.file?(path)

  content = File.read(path, encoding: "UTF-8")

  # Remove leading blank lines
  content = content.sub(/\A\n+/, "")

  # Normalize: at most one blank line after each ## heading
  content = content.gsub(/(^## .+$)\n\n+/, "\\1\n\n")

  # Ensure single trailing newline only (no trailing blank line)
  content = content.sub(/\n*\z/, "\n")

  File.write(path, content, encoding: "UTF-8")
end
