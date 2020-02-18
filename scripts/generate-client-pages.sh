#!/usr/bin/env ruby

require 'yaml'

File.open('./data/clients.yaml', 'r') do |f|
    languages = YAML.load(f)
    languages.each do |l|
        language = l['language']
        metadata = "---\ntitle: #{language}\n---\n"
        dest_file = "./content/download/#{language.downcase}.md"

        File.open(dest_file, 'w') do |f|
            f.write(metadata)
            f.close()
        end
    end
end
