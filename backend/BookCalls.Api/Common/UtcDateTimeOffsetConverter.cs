using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BookCalls.Api.Common;

/// <summary>
/// Сериализует utcDateTime строго в формате контракта "yyyy-MM-ddTHH:mm:ssZ".
/// На чтении принимает любой ISO 8601 и нормализует к UTC.
/// </summary>
public class UtcDateTimeOffsetConverter : JsonConverter<DateTimeOffset>
{
    private const string Format = "yyyy-MM-ddTHH:mm:ssZ";

    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var raw = reader.GetString();
        if (string.IsNullOrWhiteSpace(raw))
            throw new JsonException("Ожидалась дата-время в формате ISO 8601.");

        return DateTimeOffset.Parse(
            raw,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal);
    }

    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions options)
        => writer.WriteStringValue(value.ToUniversalTime().ToString(Format, CultureInfo.InvariantCulture));
}
