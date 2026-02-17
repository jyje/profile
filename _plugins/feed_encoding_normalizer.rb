# frozen_string_literal: true

# Normalize feed.xml output so smart quotes and apostrophes are replaced with
# ASCII equivalents. This prevents UTF-8 mojibake (e.g. course's → course셲)
# when the feed is served or consumed by readers that mis-detect encoding.
#
# Replaces: ' (U+2018), ' (U+2019), " (U+201C), " (U+201D) with ', ', ", "

Jekyll::Hooks.register(:pages, :post_render) do |page|
  next unless page.url == "/feed.xml" || page.path == "feed.xml"

  page.output = page.output
    .gsub("\u2018", "'")   # left single quote → ASCII apostrophe
    .gsub("\u2019", "'")   # right single quote → ASCII apostrophe
    .gsub("\u201C", '"')   # left double quote → ASCII quote
    .gsub("\u201D", '"')   # right double quote → ASCII quote
end
