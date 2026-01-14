using ClosedXML.Excel;
using System.Data;
using System.Reflection;
namespace MSC.Shared.Services
{
    public interface IBaseExportExcelService
    {
        public void CreateSheets(List<string> sheetNames, List<List<ExportBasic>> headers, string? fontName = "Arial");
        public void WriteData<T>(List<T> exportData, int sheetIndex, int startRow, int startColumn = 1);
        public byte[] Save();
    }

    public static class DataType
    {
        public const string String = "string";
        public const string Int = "int";
        public const string Int32 = "int32";
        public const string Int64 = "int64";
        public const string Long = "long";
        public const string Float = "float";
        public const string FloatSingle = "single";
        public const string Double = "double";
        public const string Decimal = "decimal";
        public const string DateTime = "datetime";
        public const string Date = "dateonly";
    }

    public class ExportBasic
    {
        public required string Title { get; set; }
        public required string Field { get; set; }
        public required Type DataType { get; set; }
        public string DateTimeFormat { get; set; } = "dd/MM/yyyy HH:mm:ss";
        public string DateFormat { get; set; } = "dd/MM/yyyy";
    }

    public class BaseExportExcelService : IBaseExportExcelService
    {
        protected readonly IXLWorkbook Workbook = new XLWorkbook();
        private List<List<ExportBasic>> _headers = new List<List<ExportBasic>>();

        public void CreateSheets(List<string> sheetNames, List<List<ExportBasic>> headers, string? fontName = "Arial")
        {
            if (sheetNames.Count != headers.Count)
            {
                return;
            }

            _headers = headers;
            Workbook.CalculateMode = XLCalculateMode.Manual;
            Workbook.Style.Font.FontName = fontName;

            for (int sheetIndex = 0; sheetIndex < sheetNames.Count; sheetIndex++)
            {
                string sheetName = sheetNames[sheetIndex];
                IXLWorksheet? sheet = Workbook.Worksheets.Add(sheetName);
                List<ExportBasic> headersSheet = _headers[sheetIndex];
                for (int i = 0; i < headersSheet.Count; i++)
                {
                    IXLCell? cell = sheet.Cell(1, i + 1);
                    ExportBasic header = headersSheet[i];
                    cell.Value = header.Title;
                    cell.Style.Font.Bold = true;

                    sheet.Column(i + 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    switch (header.DataType.Name.ToLower())
                    {
                        case DataType.String:
                            sheet.Column(i + 1).Style.Alignment.WrapText = true;
                            sheet.Column(i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                            sheet.Column(i + 1).Width = 35;
                            break;
                        case DataType.DateTime:
                            sheet.Column(i + 1).Style.DateFormat.Format = header.DateTimeFormat;
                            sheet.Column(i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            sheet.Column(i + 1).Width = 20;
                            break;
                        case DataType.Date:
                            sheet.Column(i + 1).Style.DateFormat.Format = header.DateFormat;
                            sheet.Column(i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            sheet.Column(i + 1).Width = 12;
                            break;
                        case DataType.Int:
                        case DataType.Int32:
                        case DataType.Int64:
                        case DataType.Long:
                        case DataType.Float:
                        case DataType.FloatSingle:
                        case DataType.Double:
                        case DataType.Decimal:
                            sheet.Column(i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                            sheet.Column(i + 1).Style.NumberFormat.Format = "#,##0";
                            sheet.Column(i + 1).Width = 12;
                            break;
                    }

                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                }
            }
        }

        public void WriteData<T>(List<T> exportData, int sheetIndex, int startRow, int startColumn = 1)
        {
            IXLWorksheet? sheet = Workbook.Worksheet(sheetIndex + 1);
            if (sheet == null)
            {
                return;
            }

            DataTable dataTable = new DataTable();
            foreach (ExportBasic t in _headers[sheetIndex])
            {
                dataTable.Columns.Add(t.Field, t.DataType.Name.ToLower() == DataType.Date ? typeof(DateTime) : t.DataType);
            }

            PropertyInfo[] props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance); // các propertiess (public & instance) trong class T
            PropertyInfo?[] properties = new PropertyInfo[_headers[sheetIndex].Count]; // property tương ứng với từng header

            for (int j = 0; j < _headers[sheetIndex].Count; j++)
            {
                properties[j] = props.FirstOrDefault(t => t.Name.ToUpper().Equals(_headers[sheetIndex][j].Field.ToUpper()));
            }

            // Stopwatch stopwatch = Stopwatch.StartNew();
            foreach (T x1 in exportData)
            {
                object?[] values = new object?[_headers[sheetIndex].Count];
                for (int j = 0; j < _headers[sheetIndex].Count; j++)
                {
                    PropertyInfo? prop = properties[j];

                    if (prop == null)
                    {
                        values[j] = null;
                        continue;
                    }

                    object? value = prop.GetValue(x1, null);
                    values[j] = value;

                    dataTable.Rows.Add(values);
                }

                // add 1 row for header
                sheet.Cell(startRow + 1, startColumn).InsertData(dataTable);
            }
        }

        public byte[] Save()
        {
            using MemoryStream ms = new MemoryStream();
            Workbook.SaveAs(ms);
            return ms.ToArray();
        }
    }

}
