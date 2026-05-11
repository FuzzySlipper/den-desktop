namespace DenMcp.Desktop.Sidecar;

public enum CollaborationSegmentType
{
    Heading,
    Paragraph,
    CodeBlock,
    List,
    BlockQuote
}

public enum CollaborationAnnotationType
{
    Note,
    Skip,
    Done,
    Flag
}

public sealed class CollaborationSegment
{
    public long Id { get; set; }
    public long TurnId { get; set; }
    public int SequenceNumber { get; set; }
    public required string SegmentHash { get; set; }
    public CollaborationSegmentType SegmentType { get; set; }
    public required string RawMarkdown { get; set; }
    public string? Text { get; set; }
    public int? HeadingLevel { get; set; }
    public string? CodeLanguage { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class CollaborationAnnotation
{
    public long Id { get; set; }
    public long SessionId { get; set; }
    public long TurnId { get; set; }
    public long SegmentId { get; set; }
    public required string SegmentHash { get; set; }
    public CollaborationAnnotationType AnnotationType { get; set; }
    public string? Body { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public int Revision { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
