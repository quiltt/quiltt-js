package app.quiltt.example

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val launchConnectorBtn: Button = findViewById(R.id.launch_connector_button)

        launchConnectorBtn.setOnClickListener {
            println("Button clicked!")
            val intent = Intent(this, QuilttConnectorActivity::class.java)
            startActivity(intent)
        }
    }
}