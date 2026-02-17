# frozen_string_literal: true

# Generates _sass/_injected.scss from Liquid-rendered _includes/styles/variables.scss
# so the main stylesheet can start with @use "injected" and use @use everywhere (no @import deprecation).

module Jekyll
  class SassInjectedGenerator < Generator
    priority :high

    def generate(site)
      src = File.join(site.source, "_includes", "styles", "variables.scss")
      out = File.join(site.source, "_sass", "_injected.scss")
      return unless File.file?(src)

      content = File.read(src)
      template = Liquid::Template.parse(content)
      ctx = Liquid::Context.new({ "site" => site.to_liquid }, {}, { site: site })
      rendered = template.render(ctx)
      FileUtils.mkdir_p(File.dirname(out))
      # Only write when content changed to avoid watch loop: plugin write -> mtime change -> rebuild -> repeat
      if !File.file?(out) || File.read(out) != rendered
        File.write(out, rendered)
      end
    end
  end
end
