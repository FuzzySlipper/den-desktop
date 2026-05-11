namespace DenMcp.Desktop.Sidecar;

internal static class MarkdownFenceHelper
{
    internal static bool TryFence(string line, out string fence, out string? language)
    {
        fence = string.Empty;
        language = null;
        var trimmed = line.TrimStart();

        if (trimmed.StartsWith("```", StringComparison.Ordinal))
            fence = "```";
        else if (trimmed.StartsWith("~~~", StringComparison.Ordinal))
            fence = "~~~";
        else
            return false;

        language = trimmed[fence.Length..].Trim();
        if (language.Length == 0)
            language = null;
        return true;
    }

    internal static string ExtractFencedContent(string rawMarkdown)
    {
        var normalized = rawMarkdown.Replace("\r\n", "\n").Replace('\r', '\n');
        var lines = normalized.Split('\n');
        if (lines.Length == 0 || !TryFence(lines[0], out var fence, out _))
            return rawMarkdown.Trim();

        var end = lines.Length;
        if (end > 1 && lines[^1].TrimStart().StartsWith(fence, StringComparison.Ordinal))
            end--;

        return string.Join('\n', lines[1..end]).Trim('\n');
    }
}
