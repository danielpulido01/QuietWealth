namespace QuietWealth.Bakend.Shared.Abstractions;

// Compatibility bridge while the source tree still contains both Bakend and Backend namespaces.
public interface IDomainEvent : QuietWealth.Backend.Shared.Abstractions.IDomainEvent;
