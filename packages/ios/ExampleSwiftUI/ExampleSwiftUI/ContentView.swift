import Foundation
import SwiftUI

struct ContentView: View {
    @State private var showHomeView = true
    @State var connectionId = "No Connection ID"

    var body: some View {
        VStack {
            if showHomeView {
                HomeView(showHomeView: $showHomeView, connectionId: $connectionId)
            } else {
                ConnectorView(showHomeView: $showHomeView, connectionId: $connectionId)
            }
        }
    }
}
