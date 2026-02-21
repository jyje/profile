# frozen_string_literal: true

# Inline Cards — Renders ```card fenced code blocks as styled inline card components.
#
# Usage in Markdown (posts, pages, documents):
#
#   Single card:
#   ```card
#   ---
#   title: 성과
#   icon: icon-star
#   description: 2025년 주요 성과
#   link: /ko/posts#y-2025
#   ---
#   ```
#
#   Card grid (array of cards):
#   ```card
#   ---
#   - title: 성과
#     icon: icon-star
#     description: 2025년 주요 성과
#     link: /ko/posts#y-2025
#   - title: 기술
#     icon: icon-code
#     description: 2025년 기술 스택
#     link: /tags
#   ---
#   ```
#
# Supported fields per card:
#   title       (required) card heading
#   icon        (optional) symbol class, e.g. icon-star
#   description (optional) body text; supports inline Markdown (links, bold, etc.)
#   link        (optional) destination URL; if omitted, CTA is not rendered
#   cta         (optional) call-to-action label; defaults to 'Read more →'

require 'yaml'
require 'kramdown'

module Jekyll
  module InlineCards
    HTML_ENTITIES = {
      '&amp;'  => '&',
      '&lt;'   => '<',
      '&gt;'   => '>',
      '&quot;' => '"',
      '&#39;'  => "'",
      '&#x27;' => "'",
      '&#x2F;' => '/',
    }.freeze

    def self.decode_entities(str)
      HTML_ENTITIES.reduce(str) { |s, (entity, char)| s.gsub(entity, char) }
    end

    def self.render_inline_markdown(text)
      return '' if text.nil? || text.strip.empty?

      html = Kramdown::Document.new(text.strip, input: 'GFM').to_html.strip
      # Unwrap single <p> tag to keep it inline inside <p class="inline-card-desc">
      html.gsub(/\A<p>(.*)<\/p>\z/m, '\1').strip
    end

    DEFAULT_ICON = 'icon-file-empty'.freeze

    def self.external_link?(url)
      url.start_with?('http://', 'https://')
    end

    def self.build_card_html(card)
      title       = card['title'].to_s.strip
      icon        = card['icon'].to_s.strip
      icon        = DEFAULT_ICON if icon.empty?
      description = card['description'].to_s.strip
      link        = card['link'].to_s.strip
      cta_text    = card['cta'].to_s.strip
      cta_text    = 'Read more →' if cta_text.empty?
      external    = !link.empty? && external_link?(link)

      lines = ['<div class="inline-card">']

      if link.empty?
        lines << "  <div class=\"inline-card-inner\">"
      else
        anchor_attrs = "href=\"#{link}\" class=\"inline-card-inner inline-card-link no-mark no-hover\""
        anchor_attrs += ' target="_blank" rel="noopener"' if external
        lines << "  <a #{anchor_attrs}>"
      end

      lines << "    <div class=\"inline-card-header\">"
      lines << "      <span class=\"inline-card-icon symbol #{icon}\"></span>"
      unless title.empty?
        ext_span = external ? ' <span class="inline-card-external symbol icon-new-tab"></span>' : ''
        lines << "      <h3 class=\"inline-card-title\">#{title}#{ext_span}</h3>"
      end
      lines << "    </div>"

      unless description.empty?
        desc_html = render_inline_markdown(description)
        lines << "    <div class=\"inline-card-desc\">#{desc_html}</div>"
      end

      unless link.empty?
        lines << "    <span class=\"inline-card-cta\">#{cta_text}</span>"
      end

      lines << (link.empty? ? "  </div>" : "  </a>")
      lines << '</div>'
      lines.join("\n")
    end

    def self.render(raw_content)
      content = decode_entities(raw_content)
      content = content.strip.delete_prefix("---").reverse.delete_prefix("---".reverse).reverse.strip

      data = YAML.safe_load(content)
      cards = data.is_a?(Array) ? data : [data]

      card_html = cards.map { |card| build_card_html(card) }.join("\n")

      <<~HTML
        <div class="inline-cards-root">
        <div class="inline-cards">
        #{card_html}
        </div>
        </div>
      HTML
    rescue => e
      Jekyll.logger.warn "InlineCards:", "Failed to parse card block: #{e.message}"
      nil
    end
  end
end

# Pattern matches both Kramdown GFM output variants:
#   <pre><code class="language-card">...</code></pre>
#   <div class="language-card highlighter-rouge"><div class="highlight"><pre ...><code>...</code></pre></div></div>
INLINE_CARDS_PATTERN = /
  # Variant 1: highlighter-rouge wrapper (GFM default)
  <div[^>]+\blanguage-card\b[^>]*>
    .*?
    <code(?:[^>]*)>(.*?)<\/code>
    .*?
  <\/div>
  |
  # Variant 2: plain pre>code (fallback)
  <pre[^>]*>\s*<code\s+class="language-card">(.*?)<\/code>\s*<\/pre>
/xm

Jekyll::Hooks.register([:posts, :documents, :pages], :post_render) do |item|
  next unless item.output_ext == '.html'
  next unless item.output&.include?('language-card')

  item.output = item.output.gsub(INLINE_CARDS_PATTERN) do
    raw = Regexp.last_match(1) || Regexp.last_match(2)
    Jekyll::InlineCards.render(raw.to_s) || Regexp.last_match(0)
  end
end
