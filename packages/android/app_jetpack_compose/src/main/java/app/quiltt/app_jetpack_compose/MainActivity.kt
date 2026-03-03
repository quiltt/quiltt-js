package app.quiltt.app_jetpack_compose

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview

// Splash screen
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.activity.viewModels
import androidx.compose.material3.Button
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        installSplashScreen().apply {
            setKeepOnScreenCondition {
                viewModel.loading.value
            }
        }

        setContent {
            MainContent()
        }
    }
}

class MainViewModel : ViewModel() {
    private val _loading = MutableStateFlow(true)
    val loading = _loading.asStateFlow()

    init {
        viewModelScope.launch {// run background task here
            delay(2000)
            _loading.value = false
        }
    }
}

@Composable
fun MainContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        LaunchConnectorButton()
    }
}

@Composable
fun LaunchConnectorButton() {
    val context = LocalContext.current
    Button(
        onClick = {
            val intent = Intent(context, QuilttConnectorActivity::class.java)
            context.startActivity(intent)
        },
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF800080))
    ) {
        Text("Launch Connector")
    }
}

@Preview(showBackground = true)
@Composable
fun QuilttHubPreview() {
    MainContent()
}