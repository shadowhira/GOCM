using System.Collections.Generic;
using System.Text.Json;

namespace OnlineClassroomManagement.Helper.Utilities
{
    public static class CosmeticConfigParser
    {
        public static Dictionary<string, string>? Parse(string? configJson)
        {
            if (string.IsNullOrWhiteSpace(configJson))
            {
                return null;
            }

            try
            {
                using JsonDocument document = JsonDocument.Parse(configJson);
                Dictionary<string, string> result = new(StringComparer.OrdinalIgnoreCase);

                if (document.RootElement.ValueKind != JsonValueKind.Object)
                {
                    return null;
                }

                foreach (JsonProperty property in document.RootElement.EnumerateObject())
                {
                    if (property.Value.ValueKind == JsonValueKind.String)
                    {
                        string? value = property.Value.GetString();
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            result[property.Name] = value.Trim();
                        }
                    }
                }

                return result.Count > 0 ? result : null;
            }
            catch
            {
                return null;
            }
        }
    }
}
