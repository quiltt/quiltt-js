import Foundation
import SwiftUI

struct HomeView: View {
    @Binding var showHomeView: Bool
    @Binding var connectionId: String
    var body: some View {
        NavigationView {
            VStack {
                Button(action: {
                  showHomeView = false
                }) {
                    Text("Launch Connector")
                }
                .padding()
                .background(Color(red: 0.3, green: 0, blue: 0.5, opacity: 1))
                .foregroundColor(.white)
                .font(.headline)
                .cornerRadius(10)
                Text(connectionId)
            }
            .navigationTitle("Home View")
        }
    }
}

#Preview {
    HomeView(showHomeView: .constant(true), connectionId: .constant("connectionId"))
}
