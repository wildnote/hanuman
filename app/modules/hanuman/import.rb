module Hanuman::Import
  def self.open_spreadsheet(file_name, file_path)
    extension = case File.extname(file_name)
    when ".csv" then :csv
    when ".xls" then :xls
    when ".xlsx" then :xlsx
    else raise "Unknown file type: #{file_name}"
    end
    spreadsheet = Roo::Spreadsheet.open(file_path, extension: extension)
  end
end
