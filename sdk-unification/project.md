# Integrated SDK Testing

### **Vision Statement**

Create a unified SDK development environment that consolidates all mobile and platform-specific SDKs into a single monorepo with comprehensive CI/CD integration, ensuring consistent quality control and preventing breaking changes across deployed versions through automated testing and validation.

### **Core Problems & Needs**

* Current SDK architecture is fragmented across multiple repositories
* Mobile SDKs are not designed for monorepo builds, requiring architectural changes
* Lack of unified CI pipeline for consistent testing across all SDK platforms
* No automated integration testing against production environments
* Missing visibility into potential breaking changes for deployed SDK versions
* Need for comprehensive test coverage spanning unit and integration testing

### **Roadmap**

#### **Phase 1: Repository Consolidation**

1. Create unified SDK monorepo structure
   * Organize top-level folders by technology: Flutter, iOS, Android, Capacitor, React, Vue, …
   * Create Unified system for Change logs, Versioning, and Release Building

#### **Phase 2: Testing Infrastructure**

1. Establish unified CI pipeline for SDKs
   * Configure automated unit test execution across all SDK platforms
   * Implement integration testing against production environment
2. Set up matrix builds for API platform testing
   1. Pull SDK tests via submodule integration
   2. Configure matrix builds to test all supported released SDK versions
   3. Run integration testing on head version through submodule
   4. Exclude unit testing from this phase (handled by SDK repo)

#### **Phase 3: Unification**

1. Realign the SDKs to use as common as possible interfaces and patterns
   1. Adapt cross compiling SDK builders where possible

### **Risks & Open Questions**

* Technical complexity of adapting mobile SDKs for monorepo architecture
* Potential build system conflicts when consolidating different SDK technologies
* Performance impact of running comprehensive matrix builds across all SDK versions
* Resource requirements for testing every compiled SDK version
* Integration challenges between submodule system and main repository CI
* Timeline and effort estimation for mobile SDK architectural changes
* Dependency management across different SDK technologies in unified environment

## Milestones

* Repository Consolidation

* Testing Infrastructure

* Unification

## Metadata

- URL: [https://linear.app/quiltt/project/integrated-sdk-testing-4134d081ce6e](https://linear.app/quiltt/project/integrated-sdk-testing-4134d081ce6e)
* Status: Planned
* Lead: Zubair Aziz
* Members: Zubair Aziz
* Start date: Not set
* Target date: Not set
