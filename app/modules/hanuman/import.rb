module Hanuman::Import
  def self.open_spreadsheet(file)
    extension = case File.extname(file.original_filename)
    when ".csv" then :csv
    when ".xls" then :xls
    when ".xlsx" then :xlsx
    else raise "Unknown file type: #{file.original_filename}"
    end
    puts file.path
    spreadsheet = Roo::Spreadsheet.open(file.path, extension: extension)
  end
end
