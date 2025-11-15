package com.retro.musicplayer.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.retro.musicplayer.R
import com.retro.musicplayer.Song

class SongAdapter(
    private var songs: List<Song>,
    private val onSongClick: (Song, Int) -> Unit
) : RecyclerView.Adapter<SongAdapter.SongViewHolder>() {

    private var currentPlayingPosition = -1

    inner class SongViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val titleTextView: TextView = itemView.findViewById(R.id.songTitle)
        val artistTextView: TextView = itemView.findViewById(R.id.songArtist)
        val durationTextView: TextView = itemView.findViewById(R.id.songDuration)

        fun bind(song: Song, position: Int) {
            titleTextView.text = song.title
            artistTextView.text = song.artist
            durationTextView.text = song.getDurationString()

            // Highlight currently playing song
            if (position == currentPlayingPosition) {
                itemView.setBackgroundColor(itemView.context.getColor(R.color.retro_dark_surface))
                titleTextView.setTextColor(itemView.context.getColor(R.color.retro_cyan))
            } else {
                itemView.setBackgroundColor(itemView.context.getColor(R.color.transparent))
                titleTextView.setTextColor(itemView.context.getColor(R.color.retro_text_primary))
            }

            itemView.setOnClickListener {
                onSongClick(song, position)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SongViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_song, parent, false)
        return SongViewHolder(view)
    }

    override fun onBindViewHolder(holder: SongViewHolder, position: Int) {
        holder.bind(songs[position], position)
    }

    override fun getItemCount(): Int = songs.size

    fun updateSongs(newSongs: List<Song>) {
        songs = newSongs
        notifyDataSetChanged()
    }

    fun setCurrentPlayingPosition(position: Int) {
        val oldPosition = currentPlayingPosition
        currentPlayingPosition = position
        notifyItemChanged(oldPosition)
        notifyItemChanged(currentPlayingPosition)
    }
}
